import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import dayjs from 'dayjs';

export async function POST(req: NextRequest) {
    try {
        // 🔒 SECURITY: Verify authenticated user from session
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse only non-sensitive data from request body
        const { medical_notes } = await req.json();

        // Input validation
        if (!medical_notes) {
            return NextResponse.json({ error: 'Missing medical_notes' }, { status: 400 });
        }

        if (typeof medical_notes !== 'string') {
            return NextResponse.json({ error: 'Medical notes must be a string' }, { status: 400 });
        }

        if (medical_notes.trim().length === 0) {
            return NextResponse.json({ error: 'Medical notes cannot be empty' }, { status: 400 });
        }

        if (medical_notes.length > 50000) {
            return NextResponse.json({ error: 'Medical notes too long (max 50,000 characters)' }, { status: 400 });
        }

        // Basic content sanitization - remove potentially harmful patterns
        const sanitizedNotes = medical_notes
            .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .trim();

        // Use authenticated user's ID (not from request body)
        const authenticatedUserId = user.id;

        const freeQuota = 3;

        // Get the user's records
        const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .select('daily_usage_count, last_used_at, is_paid')
            .eq('id', authenticatedUserId)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: userError?.message || 'User not found' }, { status: 404 });
        }

        // Paid users bypass the usage limit
        if (userData.is_paid) {
            return await generateSummary(authenticatedUserId, sanitizedNotes, medical_notes);
        }

        const today = dayjs().format('YYYY-MM-DD');
        const lastUsedAt = userData.last_used_at ? dayjs(userData.last_used_at).format('YYYY-MM-DD') : null;

        if (lastUsedAt !== today) {
            // New day -> reset counter to 1
            await supabaseAdmin
                .from('users')
                .update({daily_usage_count: 1, last_used_at: today})
                .eq('id', authenticatedUserId);
        } else if (userData.daily_usage_count >= freeQuota) {
            // Limit reached 
            return NextResponse.json({ error: 'Usage limit reached' }, { status: 403 });
        } else {
            // Same day -> increment counter
            await supabaseAdmin
                .from('users')
                .update({daily_usage_count: userData.daily_usage_count + 1})
                .eq('id', authenticatedUserId);
        }

        return await generateSummary(authenticatedUserId, sanitizedNotes, medical_notes);

    } catch (error) {
        console.error('Generate summary API error:', error);
        return NextResponse.json({ 
            error: 'An error occurred while processing your request. Please try again.' 
        }, { status: 500 });
    }
}

// Generate summary function with proper error handling
async function generateSummary(user_id: string, sanitized_notes: string, original_medical_notes: string) {
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
                    { role: 'user', content: sanitized_notes },
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
                    { role: 'user', content: sanitized_notes },
                ],
            }),
        });

        if (!dischargePlanRes.ok) {
            const errorText = await dischargePlanRes.text();
            throw new Error(`OpenAI Discharge Plan API failed: ${dischargePlanRes.status} - ${errorText}`);
        }

        const dischargePlanData = await dischargePlanRes.json();
        const dischargePlan = (dischargePlanData.choices?.[0]?.message?.content as string) || '';

        // Insert into Supabase (store original medical_notes for record keeping)
        const { error: insertError } = await supabaseAdmin
            .from('records')
            .insert([{
                user_id,
                medical_notes: original_medical_notes,
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

