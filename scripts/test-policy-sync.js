// Test-Skript für Policy Embedding Sync
// Führe aus mit: node scripts/test-policy-sync.js

const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

require('dotenv').config({ path: '.env' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  try {
    console.log('🔄 Starte Policy Sync...');

    // 1. Hole alle aktiven Policen von Supabase
    const { data: policies, error: policiesError } = await supabase
      .from('policies')
      .select(`
        id,
        policyNumber,
        status,
        premium,
        coverage,
        startDate,
        users:userId (name),
        companies:companyId (name)
      `)
      .neq('status', 'CANCELLED');

    if (policiesError) {
      console.error('❌ Fehler beim Laden der Policen:', policiesError);
      return;
    }

    console.log(`📋 Gefunden: ${policies.length} Policen`);

    if (policies.length === 0) {
      console.log('⚠️  Keine Policen gefunden');
      return;
    }

    // 2. Erstelle Content für jede Police
    const policyContents = policies.map(policy => {
      const content = `
Police ${policy.policyNumber}
Kunde: ${policy.users?.name || 'Unbekannt'}
Firma: ${policy.companies?.name || 'Privat'}
Status: ${policy.status}
Prämie: CHF ${policy.premium / 100}
Deckung: CHF ${policy.coverage / 100}
Gültig ab: ${new Date(policy.startDate).toISOString().split('T')[0]}
Typ: Cyberversicherung
      `.trim();

      return {
        policyId: policy.id,
        content,
        metadata: {
          policyNumber: policy.policyNumber,
          userName: policy.users?.name || 'Unbekannt',
          companyName: policy.companies?.name || null,
          status: policy.status,
        },
      };
    });

    console.log('🤖 Generiere Embeddings...');

    // 3. Generiere Embeddings
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: policyContents.map(p => p.content),
    });

    const embeddings = response.data.map(d => d.embedding);
    console.log(`✅ ${embeddings.length} Embeddings generiert`);

    // 4. Lösche alte Chunks
    const policyIds = policyContents.map(p => p.policyId);
    const { error: deleteError } = await supabase
      .from('policy_chunks')
      .delete()
      .in('policy_id', policyIds);

    if (deleteError) {
      console.error('❌ Delete Error:', deleteError);
    } else {
      console.log('🗑️  Alte Chunks gelöscht');
    }

    // 5. Füge neue Chunks ein
    const records = policyContents.map((policy, i) => ({
      policy_id: policy.policyId,
      content: policy.content,
      embedding: embeddings[i],
      chunk_index: 0,
      metadata: policy.metadata,
    }));

    const { error: insertError } = await supabase
      .from('policy_chunks')
      .insert(records);

    if (insertError) {
      console.error('❌ Insert Error:', insertError);
      throw insertError;
    }

    console.log(`✅ ${records.length} Policen synchronisiert!`);

    // 6. Test: Suche nach einer Police
    console.log('\n🔍 Teste Vector Search...');
    const testQuery = 'Welche Police hat Hans Muster?';
    const testResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: testQuery,
    });
    const testEmbedding = testResponse.data[0].embedding;

    const { data: searchResults, error: searchError } = await supabase.rpc(
      'match_policy_chunks',
      {
        query_embedding: testEmbedding,
        match_threshold: 0.5,
        match_count: 5,
      }
    );

    if (searchError) {
      console.error('❌ Search Error:', searchError);
    } else {
      console.log(`✅ Gefunden: ${searchResults?.length || 0} Ergebnisse`);
      if (searchResults && searchResults.length > 0) {
        console.log('\nTop Ergebnis:');
        console.log('- Policy ID:', searchResults[0].policy_id);
        console.log('- Similarity:', searchResults[0].similarity);
        console.log('- Content:', searchResults[0].content.substring(0, 100) + '...');
      }
    }

  } catch (error) {
    console.error('❌ Fehler:', error);
  }
}

main();
