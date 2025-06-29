export async function POST(request: Request) {
    try {
      const { medicalNotes } = await request.json();
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a clinical documentation AI assistant. Your task is to read and understand raw medical clerk notes (including patient history, physical exam findings, test results, treatment plans, and hospital course), and generate a clear, concise, and professionally written hospital discharge summary. The discharge summary should include the following structured sections:\n\n1. Patient Information: Include name, age, gender, and hospital ID if available.\n2. Date of Admission & Discharge\n3. Admitting Diagnosis\n4. Hospital Course: Describe major clinical events, treatments, procedures, and how the patient's condition evolved.\n5. Investigations: Summarize key lab results and imaging findings that influenced care.\n6. Treatment Given: Include surgeries, medications, therapies, or interventions.\n7. Discharge Medications\n8. Follow-Up Plan: Recommended next steps, outpatient follow-up, red flag symptoms.\n9. Condition on Discharge: Summary of patient’s status at discharge.\n10. Consultations: List specialist input if any.\n11. Additional Notes: Any relevant social, psychological, or compliance factors.\n\nFollow these principles:\n- Use professional medical language, but keep it readable for clinicians and discharge planners.\n- Infer missing but obvious details only when clinically appropriate.\n- Never hallucinate—if something is missing or unclear, either leave it blank or make it clear it's not documented.\n\nInput: Raw, possibly unstructured, medical clerk notes from any point during hospitalization.\n\nOutput: A well-formatted, accurate discharge summary in formal medical tone.\n\nRespond only with the discharge summary. Do not explain or comment on your output."},
            { role: "user", content: medicalNotes },
          ],
        }),
      });
  
      if (!response.ok) {
        const error = await response.text();
        return new Response(JSON.stringify({ error }), { status: response.status });
      }
  
      const data = await response.json();
      return new Response(
        JSON.stringify({ summary: data.choices[0].message.content }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      // Log the error for debugging
      console.error("API Route Error:", err);
      return new Response(
        JSON.stringify({ error: (err as Error).message }),
        { status: 500 }
      );
    }
  }