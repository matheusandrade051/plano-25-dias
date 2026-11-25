# Plano 25 Dias

App web pessoal (PWA, mobile-first) para acompanhar um plano de emagrecimento de 25 dias.
Tudo em português do Brasil, usando apenas planos gratuitos: **Vercel (Hobby)** e **Supabase (Free)**.

**Tecnologias:** Next.js (App Router) + TypeScript, Tailwind CSS, Supabase (Postgres + login por link no e-mail), Recharts.

---

## O que o app faz

- **Hoje:** dia X de 25, peso do dia, barras de calorias e proteína, água (+250/+500 ml), passos, sono e treino do dia.
- **Peso:** registro rápido, gráfico (peso, média de 7 dias e linha da meta), total perdido e comparação com os marcos (dia 7, 14 e 25).
- **Alimentação:** refeições por tipo, adicionar/editar/excluir, totais e navegação entre dias.
- **Histórico:** lista por dia e resumo semanal.
- **Configurações:** metas, data de início e sair da conta.

---

## Passo a passo (para iniciantes)

### Antes de tudo: instalar o Node.js
Baixe a versão **LTS** em <https://nodejs.org>, instale e reinicie o terminal. Confira com `node -v`.

### 1. Criar o projeto no Supabase (plano Free)
1. Acesse <https://supabase.com> e crie uma conta.
2. Clique em **New project**, escolha um nome (ex.: `plano-25-dias`), uma senha para o banco (guarde-a) e a região **South America (São Paulo)**.
3. Escolha o plano **Free** e aguarde a criação (1 a 2 minutos).
4. Vá em **Project Settings → API** e copie:
   - **Project URL** → será o `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → será o `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Rodar a migration SQL
1. No Supabase, abra **SQL Editor → New query**.
2. Abra o arquivo `supabase/migrations/0001_init.sql` deste projeto, copie **todo** o conteúdo e cole no editor.
3. Clique em **Run**. Deve aparecer "Success". Isso cria as tabelas, a segurança (RLS) e o gatilho que gera suas configurações padrão no primeiro login.

### 3. Configurar a autenticação (Site URL e Redirect URLs)
Em **Authentication → URL Configuration**:
- **Site URL:** `http://localhost:3000` (depois troque pelo endereço da Vercel, ex.: `https://seu-app.vercel.app`).
- **Redirect URLs:** adicione as duas linhas:
  - `http://localhost:3000/**`
  - `https://seu-app.vercel.app/**` (use o seu domínio real da Vercel)

Em **Authentication → Providers**, confirme que **Email** está ativado. O login é por link mágico: não há senha.

> O Supabase Free limita o envio de e-mails por hora. Para uso pessoal é suficiente. Se um e-mail demorar, olhe a caixa de spam.

### 4. Rodar localmente
No terminal, dentro da pasta do projeto:

```powershell
npm install
Copy-Item .env.example .env.local
```

Abra o `.env.local` e preencha as duas variáveis com os valores do passo 1. Depois:

```powershell
npm run dev
```

Abra <http://localhost:3000>, informe seu e-mail e clique no link recebido (abra-o no mesmo navegador).

Comandos úteis: `npm run lint` (verificar o código) e `npm run build` (gerar a versão de produção).

### 5. Subir para o GitHub
1. Crie uma conta em <https://github.com> e um repositório novo (pode ser privado), **sem** README.
2. No terminal, dentro da pasta do projeto:

```powershell
git init
git add .
git commit -m "Plano 25 Dias"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/plano-25-dias.git
git push -u origin main
```

O arquivo `.env.local` **não** é enviado (está no `.gitignore`). Nunca publique suas chaves.

### 6. Importar na Vercel e configurar as variáveis
1. Acesse <https://vercel.com>, entre com sua conta do GitHub (plano **Hobby**, gratuito).
2. Clique em **Add New → Project** e importe o repositório.
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**. Ao terminar, copie o endereço (ex.: `https://plano-25-dias.vercel.app`).
5. Volte ao Supabase (**Authentication → URL Configuration**) e ajuste a **Site URL** e as **Redirect URLs** com esse endereço (passo 3).

### 7. Instalar na tela inicial do celular
- **Android (Chrome):** abra o endereço da Vercel → menu **⋮** → **Instalar app** (ou **Adicionar à tela inicial**).
- **iPhone (Safari):** abra o endereço no **Safari** → botão **Compartilhar** → **Adicionar à Tela de Início**.

> Faça o login pelo link do e-mail dentro do navegador onde você vai usar. No iPhone, depois de instalar o app, pode ser necessário entrar de novo uma vez.

---

## Observações
- O "hoje" do app usa sempre o fuso **America/Sao_Paulo**.
- Todos os dados são privados: cada tabela tem RLS e só você enxerga seus registros.
- O aviso de menos de 1.500 kcal é um lembrete gentil, não uma orientação médica. Em caso de dúvida, procure um profissional de saúde.
- O app precisa de internet (não há modo offline nesta versão).

## Estrutura

```
supabase/migrations/   SQL do banco
public/                manifest.json e ícones
src/app/               telas (login, Hoje, peso, alimentacao, historico, configuracoes)
src/components/        componentes de interface
src/lib/               datas, formatação, regras do plano, validação, Supabase
```
