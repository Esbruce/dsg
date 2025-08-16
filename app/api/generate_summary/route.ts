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
            .select('daily_usage_count, last_used_at, is_paid, unlimited_until')
            .eq('id', authenticatedUserId)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: userError?.message || 'User not found' }, { status: 404 });
        }

        // Paid users or users within unlimited period bypass the usage limit
        if (userData.is_paid || (userData as any).unlimited_until && dayjs((userData as any).unlimited_until).isAfter(dayjs())) {
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
                        content: `
You are an expert medical discharge summary generator trained to produce discharge summaries in line with UK clinical practice standards. Your role is to convert detailed clarking notes into clear, concise, and professionally written discharge summaries suitable for both healthcare professionals and patients.

The discharge summary must strictly follow this structure and wording format:

⸻

Discharge Summary Format:

Begin with this exact sentence:
'[Patient Name] attended [Hospital Name] on [Admission Date] with'... then add here what their presenting complaint is. Do NOT make up names, hospitals or admission dates just leave it as it is.
Then provide a brief one or two sentence summary of the clinical presentation and any relevant background (not their entire past medical history).

In the next paragraph, describe the investigations performed, only including those that influenced diagnosis or management.
👉 Do not include vital signs, routine observations, or non-significant/normal test results. Focus only on essential findings such as abnormal blood tests, relevant imaging, or diagnostic procedures.

In a new paragraph, summarise the treatments provided during admission. Include key interventions such as medications, procedures, and any supportive care, written clearly and succinctly.

In the next paragraph, summarise the advice given to the patient, including any safety netting, return precautions, follow-up arrangements, and self-care instructions. Then add a sentence, 'They are now medically-ready to be discharged'.

Crucially, do not include the discharge plan as this is going to be included elsewhere. 

⸻

*Additional Instructions:*

*Writing Guidelines:*

- Use full sentences and professional, formal language throughout.
- Do not use section headers; instead, structure the content using paragraph breaks to maintain flow.
- Omit vital signs, routine examination findings, and any non-significant or normal investigation results.
- Be succinct, but ensure all clinically relevant information is clearly included.
- Use plain English wherever possible, while maintaining medical accuracy and clarity.
- Assume the document will be read by both healthcare professionals (particularly GPs) and the patient.

*Confidentiality and Style Notes:*

- Never include patient names. Begin the document with: *”[The patient] attended [hospital name] on [date of presentation] with…”* — do not populate these placeholders.
- Refer to the individual as “the patient” only if necessary, and try to avoid repetition.
- Do not create or guess specific dates (e.g., date of admission); always leave these as placeholders.

*Clinical Content Guidance:*

- Only include past medical history if it is *clinically relevant* to the current presentation (e.g., abdominal pain in a patient with Crohn’s disease, or breathlessness in a patient with asthma).
- Label investigations simply as *“Investigations”* — avoid titles like “Key Investigations.”
- If documenting a multi-day hospital stay, summarise the important events without unnecessary repetition. Indicate the total duration of admission and clearly state the reason the patient is now medically fit for discharge.
- Avoid acronyms unless widely recognised and understood (e.g.,CT,MRI,A+E).`,
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
                        content: `You are an expert medical discharge summary generator trained to produce discharge summaries in line with UK clinical practice standards. You are given the pasted medical documentation of a patients admission including the discharge plan. The bulk of the medical discharge has been written elsewhere, with just the plan remaining. 
DO NOT WRITE ANYTHING EXCEPT THE PLAN. 

You are job is to write the Discharge Plan section as follows:

Title the paragraph it Discharge plan, then present the GP plan in note form, but without bullet points (but new line for each point) or concise phrases with improved grammar and punctuation. Do not attempt to rewrite or summarise the plan in full prose, as crucial clinical details could be missed. Keep it close to the original wording from the clerking notes, but ensure consistency, accuracy, and readability.

Additional instructions:

• Only include the *discharge plan* — do *not* include a presentation section or any other information related to the admission.

• Never include patient names or other identifiable information`,
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

        return NextResponse.json({ summary, discharge_plan: dischargePlan });

    } catch (error) {
        console.error('Generate summary function error:', error);
        throw error; // Re-throw to be caught by main function
    }
}

