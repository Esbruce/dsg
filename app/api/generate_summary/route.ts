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
        // Call OpenAI directly to generate summary
        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
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
                        content: `You are a clinical documentation AI assistant. Your task is to read and understand raw medical clerk notes (including patient history, physical exam findings, test results, treatment plans, and hospital course), and generate a clear, concise, and professionally written hospital discharge summary. The discharge summary should include structured sections such as Patient Information, Admission & Discharge dates, Admitting Diagnosis, Hospital Course, Investigations, Treatment Given, Discharge Medications, Follow-Up Plan, Condition on Discharge, Consultations, and Additional Notes. Follow professional medical tone, avoid hallucination, and fill only with documented data.`,
                    },
                    { role: 'user', content: medical_notes },
                ],
            }),
        });

        if (!openaiRes.ok) {
            const errorText = await openaiRes.text();
            throw new Error(`OpenAI API failed: ${openaiRes.status} - ${errorText}`);
        }

        const openaiData = await openaiRes.json();
        const summary = (openaiData.choices?.[0]?.message?.content as string) || '';

        // Insert into Supabase
        const { error: insertError } = await supabaseAdmin
            .from('records')
            .insert([{
                user_id,
                medical_notes,
                summary,
                responses: null,
            }]);

        if (insertError) {
            throw new Error(`Database insert failed: ${insertError.message}`);
        }

        return NextResponse.json({ summary });

    } catch (error) {
        console.error('Generate summary function error:', error);
        throw error; // Re-throw to be caught by main function
    }
}

