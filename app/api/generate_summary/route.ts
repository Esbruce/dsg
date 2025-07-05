import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import dayjs from 'dayjs';

export async function POST(req: NextRequest) {
    try {
        const { user_id, medical_notes } = await req.json();

        if (!user_id || !medical_notes) {
            return NextResponse.json({ error: 'Missing user_id or medical_notes' }, { status: 400 });
        }

        const freeQuota = 3;

        // Get the user's records
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('daily_usage_count, last_used_at, is_paid')
            .eq('id', user_id)
            .single();

        if (userError || !user) {
            return NextResponse.json({ error: userError?.message || 'User not found' }, { status: 404 });
        }

        // Paid users bypass the usage limit
        if (user.is_paid) {
            return await generateSummary(user_id, medical_notes);
        }

        const today = dayjs().format('YYYY-MM-DD');
        const lastUsedAt = user.last_used_at ? dayjs(user.last_used_at).format('YYYY-MM-DD') : null;

        if (lastUsedAt !== today) {
            // New day -> reset counter to 1
            await supabaseAdmin
                .from('users')
                .update({daily_usage_count: 1, last_used_at: today})
                .eq('id', user_id);
        } else if (user.daily_usage_count >= freeQuota) {
            // Limit reached 
            return NextResponse.json({ error: 'Usage limit reached' }, { status: 403 });
        } else {
            // Same day -> increment counter
            await supabaseAdmin
                .from('users')
                .update({daily_usage_count: user.daily_usage_count + 1})
                .eq('id', user_id);
        }

        return await generateSummary(user_id, medical_notes);

    } catch (error) {
        console.error('Generate summary API error:', error);
        return NextResponse.json({ 
            error: 'Internal server error: ' + (error as Error).message 
        }, { status: 500 });
    }
}

// Generate summary function with proper error handling
async function generateSummary(user_id: string, medical_notes: string) {
    try {
        // Call OpenAI to generate discharge summary
        const summaryRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert medical discharge summary generator trained to produce discharge summaries in line with UK clinical practice standards. Your role is to convert detailed clarking notes into clear, concise, and professionally written discharge summaries suitable for both healthcare professionals and patients.

The discharge summary must strictly follow this structure and wording format:

Begin with the sentence:
[Patient Name] attended [Hospital Name] on [Admission Date] with [Presenting Complaint].
Provide a brief one or two sentence summary of the clinical presentation and any relevant background.

In the next paragraph, describe the key investigations performed only including those that influenced diagnosis or management.
👉 Do not include vital signs, routine observations, or non-significant/normal test results. Focus only on essential findings such as abnormal blood tests, relevant imaging, or diagnostic procedures.

In a new paragraph, summarise the treatments provided during admission. Include key interventions such as medications, procedures, and any supportive care, written clearly and succinctly.

In the next paragraph, summarise the advice given to the patient, including any safety netting, return precautions, and general guidance provided during the admission.

Additional Instructions:
• Write in full sentences with professional, formal language.
• Do not use section headers—use paragraph breaks for flow.
• Exclude vital signs, routine examination findings, and non-significant or normal investigation results.
• Be concise but ensure all clinically relevant information is included.
• Use plain English where possible while maintaining medical accuracy.
• Assume the audience includes both healthcare professionals (particularly GPs) and the patient.`,
                    },
                    { role: 'user', content: medical_notes },
                ],
            }),
        });

        if (!summaryRes.ok) {
            const errorText = await summaryRes.text();
            throw new Error(`OpenAI API failed: ${summaryRes.status} - ${errorText}`);
        }

        const summaryData = await summaryRes.json();
        const summary = (summaryData.choices?.[0]?.message?.content as string) || '';

        // Call OpenAI to generate discharge plan
        const dischargePlanRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert medical discharge planning assistant trained to produce discharge plans in line with UK clinical practice standards. Your role is to convert detailed clarking notes into clear, actionable discharge plans for GPs and ongoing patient care.

The discharge plan must strictly follow this structure:

Start with a brief one-sentence context of the patient's presentation and admission.

Then create a section titled "Plan" and present the GP plan in note form. Use concise phrases with improved grammar and punctuation, but do not rewrite in full prose as crucial clinical details could be missed. Keep it close to the original wording from the clarking notes while ensuring consistency, accuracy, and readability.

Include the following elements where applicable:
• Follow-up arrangements and timelines
• Ongoing medication management
• Monitoring requirements
• Activity restrictions or recommendations
• Safety netting and return precautions
• Referrals to other services
• Patient education and self-care instructions
• Warning signs to watch for

Additional Instructions:
• Present the plan in note form with each point on a new line (no bullet points)
• Do not attempt to rewrite or summarise the plan in full prose
• Maintain clinical accuracy and include all relevant details from the original notes
• Use professional medical language appropriate for GP communication
• Ensure the plan is practical and actionable`,
                    },
                    { role: 'user', content: medical_notes },
                ],
            }),
        });

        if (!dischargePlanRes.ok) {
            const errorText = await dischargePlanRes.text();
            throw new Error(`OpenAI Discharge Plan API failed: ${dischargePlanRes.status} - ${errorText}`);
        }

        const dischargePlanData = await dischargePlanRes.json();
        const dischargePlan = (dischargePlanData.choices?.[0]?.message?.content as string) || '';

        // Insert into Supabase
        const { error: insertError } = await supabaseAdmin
            .from('records')
            .insert([{
                user_id,
                medical_notes,
                summary,
                discharge_plan: dischargePlan,
                responses: null,
            }]);

        if (insertError) {
            throw new Error(`Database insert failed: ${insertError.message}`);
        }

        return NextResponse.json({ summary, discharge_plan: dischargePlan });

    } catch (error) {
        console.error('Generate summary function error:', error);
        throw error; // Re-throw to be caught by main function
    }
}

