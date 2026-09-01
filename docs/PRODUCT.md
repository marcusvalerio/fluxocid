# FluxoCit — Definição do Produto

## 1. Problema

Operações logísticas (galpões, centros de distribuição, armazéns) precisam
planejar e comunicar o layout físico do espaço operacional — onde ficam
racks, corredores, docas, áreas de picking, equipamentos — mas hoje esse
planejamento normalmente é feito em:

- planilhas sem noção espacial real;
- desenhos genéricos em ferramentas de CAD complexas e não especializadas;
- papel, quadro branco ou fotos de plantas físicas;
- ferramentas 3D pesadas, caras e desproporcionais à necessidade real
  (que é, na maioria dos casos, entender e organizar o espaço em planta
  baixa, não gerar um modelo tridimensional).

Isso gera retrabalho, layouts desatualizados, dificuldade de comunicar
mudanças ao time operacional e falta de uma fonte única de verdade sobre
como o espaço está (ou deveria estar) organizado.

## 2. Público e usuários

- **Público-alvo primário:** empresas com operação logística própria
  (indústria, varejo, distribuição) que precisam organizar e comunicar o
  layout de galpões, CDs e áreas de armazenagem.
- **Usuários finais:**
  - Analistas / coordenadores de logística e operações — montam e
    mantêm os layouts.
  - Gerentes de operação — revisam e aprovam layouts, avaliam cenários.
  - Equipe de armazém — consulta o layout para entender a operação
    (leitura, principalmente).
- **Perfil de acesso:** o produto deve funcionar bem em celular, já que o
  uso ocorre tanto na mesa quanto em campo (piso de fábrica/armazém).

## 3. Proposta de valor

FluxoCit é uma ferramenta de **planejamento visual de layout logístico em
2D**, focada em ser:

- **Rápida de usar** — montar um layout deve ser tão fluido quanto
  organizar blocos em um editor de desenho, sem exigir conhecimento de
  CAD.
- **Especializada em logística** — os objetos disponíveis (pallets,
  porta-paletes, empilhadeiras, docas, corredores, áreas) já
  representam conceitos operacionais reais, com dimensões e
  comportamento coerentes com a operação.
- **Precisa** — o layout mantém relação real com a escala física do
  espaço (metros, não apenas pixels), permitindo decisões de
  dimensionamento confiáveis.
- **Acessível em qualquer lugar** — utilizável em celular, tablet ou
  desktop, com persistência em nuvem.

A referência de experiência de montagem (arrastar, posicionar, girar,
duplicar objetos livremente) é inspirada em ferramentas como o SketchUp,
mas aplicada a um editor exclusivamente 2D e voltado a logística — não é
um CAD genérico nem um modelador 3D.

## 4. Funcionalidades (visão geral)

### MVP
- Editor de layout 2D: canvas, grid, zoom, pan, seleção, arraste,
  rotação, duplicação, exclusão, undo/redo, snapping, alinhamento.
- Biblioteca inicial de objetos: paredes, áreas delimitadas, portas,
  docas, porta-paletes, pallets, corredores, empilhadeira, paleteira.
- Painel de propriedades por objeto (posição, dimensão, rotação, nome,
  categoria).
- Persistência de layouts (criar, salvar, reabrir, editar).
- Autenticação de usuário (login/cadastro) e escopo de dados por
  usuário/organização.
- Interface mobile-first funcional em toque (touch), com suporte a
  mouse/teclado no desktop.

### Pós-MVP
- Biblioteca de objetos expandida (mais equipamentos, mais tipos de
  estrutura de armazenagem, áreas customizadas com cores/ícones).
- Agrupamento de objetos.
- Múltiplos layouts por organização, com listagem/organização de
  projetos.
- Compartilhamento e permissões (visualizador, editor).
- Exportação (imagem, PDF).
- Medidas e cotas visuais no canvas.
- Camadas (layers) de visualização (ex.: ocultar fluxos, ocultar
  dimensões).

### Futuro (fora do escopo atual)
- Fluxos e simulação de circulação (pessoas, empilhadeiras, materiais).
- Regras espaciais automáticas (detecção de colisão, corredor bloqueado,
  distância mínima).
- Indicadores e análises quantitativas do layout (ocupação, densidade,
  capacidade).
- Visualização 3D do layout (explicitamente fora de escopo nesta fase —
  ver `docs/ARCHITECTURE.md`).
- Integração com sistemas de WMS/ERP.

## 5. Fluxos principais (visão geral)

Ver detalhamento em `docs/USER_FLOWS.md`. Resumo:

1. Usuário se autentica.
2. Usuário cria um novo layout (ou abre um existente).
3. Usuário monta o layout no editor 2D: insere objetos da biblioteca,
   posiciona, dimensiona, rotaciona, organiza.
4. Usuário salva o layout (persistência automática/manual).
5. Usuário reabre o layout posteriormente e continua editando.

## 6. Entidades centrais (visão de produto)

- **Usuário** — pessoa que acessa o sistema.
- **Organização** (workspace) — agrupa usuários e layouts. (Proposta —
  ver seção 7.)
- **Layout (Projeto)** — um plano de galpão/CD, com nome, dimensões de
  referência (escala) e conjunto de objetos.
- **Objeto de layout** — instância de um tipo de objeto (pallet,
  porta-paletes, parede, área, equipamento etc.) posicionada em um
  layout, com propriedades próprias (posição, dimensão, rotação, nome).
- **Tipo de objeto (definição de catálogo)** — a definição reutilizável
  de um objeto (ex.: "Pallet PBR", "Empilhadeira contrabalançada"), com
  metadados de renderização e dimensões padrão.

Detalhamento técnico das entidades em `docs/DATABASE.md`.

## 7. Decisões propostas (aguardando validação quando necessário)

> Estas são propostas objetivas para preencher lacunas de requisito, não
> requisitos definidos. Decisões de baixo risco já foram assumidas com
> autonomia; decisões de maior impacto estão sinalizadas para validação.

- **DECISÃO PROPOSTA:** o produto terá o conceito de "Organização"
  (workspace) desde o início, mesmo que o MVP suporte apenas um usuário
  por organização inicialmente, para evitar retrabalho de modelagem
  depois. *(Baixo risco — seguindo com autonomia.)*
- **DECISÃO PROPOSTA:** unidade de medida padrão é o metro, com
  precisão de centímetros (2 casas decimais). *(Baixo risco — seguindo
  com autonomia.)*
- **A VALIDAR COM O USUÁRIO:** modelo de autenticação — usar
  autenticação via Supabase Auth (e-mail/senha, com possibilidade de
  login social depois) é a proposta em `docs/ARCHITECTURE.md`. Isso
  exigirá que o usuário crie um projeto Supabase e forneça as
  credenciais (URL + chave pública) quando chegarmos à Fase 4. Até lá,
  o editor funciona com persistência local (localStorage/IndexedDB) para
  não bloquear o desenvolvimento do núcleo do produto.
