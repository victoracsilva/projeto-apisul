# Gerador de Mensagens Operacionais

Página que monta as mensagens de tratativa para ocorrência (perda de sinal, sem espelhamento, atraso de viagem e atraso no início da viagem). Funciona abrindo o `index.html` no navegador, sem instalar nada.

## Estrutura

- `index.html`  - estrutura da página (campos, botões, área da mensagem)
- `style.css`   - aparência (cores no começo do arquivo, em `:root`)
- `script.js`   - lógica (textos das mensagens, seletor de data, copiar, limpar)
- `assets/`     - logos da barra azul

## Onde mexer

- **Textos das mensagens:** em `script.js`, no objeto `MODELOS`.
- **Lista de clientes:** em `script.js`, na linha `var CLIENTES = [...]`.
- **Tecnologias:** em `index.html`, nas `<option>` do campo `id="tec"`.
- **Tipos de alerta:** em `index.html` (campo `id="alerta"`) e em `script.js` (um modelo em `MODELOS` com o mesmo nome do `value`).
- **Cores:** em `style.css`, bloco `:root` no início.

## Como o `script.js` funciona

1. `atualizar()` roda a cada mudança nos campos.
2. Ela escolhe o modelo em `MODELOS` conforme o tipo de alerta e mostra só os campos que ele usa.
3. O modelo devolve uma lista de pedaços de texto: `txt()` é texto fixo, `val()` é um valor digitado (vermelho se faltar) e `man()` é um trecho manual (XXXX, em amarelo).
4. O botão COPIAR TEXTO só libera quando não há campo em vermelho.
