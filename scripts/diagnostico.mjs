// Teste de conexão com o Supabase. Uso: node --env-file=.env.local scripts/diagnostico.mjs
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Node:", process.version);
console.log("URL:", url);
console.log("Chave começa com:", key?.slice(0, 15), "| tamanho:", key?.length);
console.log("HTTPS_PROXY:", process.env.HTTPS_PROXY ?? "(nenhum)", "| NODE_OPTIONS:", process.env.NODE_OPTIONS ?? "(nenhum)");

try {
  const r = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
  console.log("RESULTADO: conectou! HTTP", r.status);
} catch (e) {
  console.log("RESULTADO: FALHOU");
  console.log("mensagem:", e.message);
  console.log("causa:", e.cause?.code, e.cause?.message);
  if (e.cause?.errors) for (const x of e.cause.errors) console.log(" -", x.code, x.address, x.port);
}
