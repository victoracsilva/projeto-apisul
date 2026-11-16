(function () {
  var $ = function (id) { return document.getElementById(id); };
  var os = $('os'), placa = $('placa'), alerta = $('alerta'), tec = $('tec'),
      data = $('data'), resultado = $('resultado'), dica = $('dica'),
      btnCopiar = $('btnCopiar'), btnLimpar = $('btnLimpar'),
      btnAgora = $('btnAgora'), status = $('status');
  var boxPlaca = $('boxPlaca'), boxTec = $('boxTec'), lblData = $('lblData');

  /* Lista de clientes: quando tiver os nomes, coloque-os aqui entre aspas, separados por vírgula.
     Exemplo: var CLIENTES = ['Cliente A', 'Cliente B']; */
  var CLIENTES = [
    'MOTO HONDA DA AMAZONIA LTDA - 29220',
    'COPOBRAS DA AMAZONIA INDUSTRIAL DE EMBALAGENS LTDA - 47820',
    'KLABIN DA AMAZONIA SOLUCOES EM EMBALAGENS DE PAPEL LTDA. - 29307',
    'KLABIN S.A. - 69509',
    'CROWN EMBALAGENS METALICAS DA AMAZONIA S/A - 43319',
    'VALGROUP - 284567',
    'MANAUARA FILMES DA AMAZONIA LTDA - 290816',
    'AMAZONIA INDUSTRIA DE PLASTICOS LTDA - 152204',
    'OESA COMERCIO E REPRESENTACOES S/A - 243462',
    'DUNORTE DISTRIBUIDORA DE PRODUTOS',
    'CLIMAZON INDUSTRIAL LTDA - 23192',
    'ENVISION INDUSTRIA DE PRODUTOS ELETRONICOS LTDA - 28977',
    'MDG INDUSTRIA E COMERCIO DE PLASTICOS LTDA - 183808',
    'FRUTS INDUSTRIA DE CONCENTRADOS DA AMAZONIA LTDA - 41582',
    'ARCELORMITTAL BRASIL S.A. - 41359',
    'PARIMA DISTRIBUIDORA LTDA - 02847540000130',
    'VIDEOLAR-INNOVA S/A - 23206',
    'BEMOL SA - 72819',
    'COPLAST INDUSTRIA QUIMICA LTDA - 29736',
    'AJ INDUSTRIA E COMERCIO DE METAIS LTDA - 202530',
    'PAM DISTRITIO 1',
    'E.P.A. - EMPRESA DE PLASTICO DA AMAZONIA LTDA. - 124066'
  ];
  var cliente = $('cliente'), boxCliente = $('boxCliente');
  (function () {
    if (!CLIENTES.length) {
      cliente.innerHTML = '<option value="">Lista de clientes a cadastrar</option>';
      cliente.disabled = true;
      return;
    }
    cliente.innerHTML = '<option value="">Selecione o cliente</option>';
    CLIENTES.forEach(function (n) {
      var o = document.createElement('option');
      o.textContent = n;
      cliente.appendChild(o);
    });
  })();
  var saudRadios = document.querySelectorAll('input[name="saud"]');
  var textoAtual = '', statusTimer;

  /* ---------- MODELOS DE TEXTO (edite aqui se precisar ajustar) ----------
     Cada modelo recebe os valores e devolve uma lista de pedaços:
       txt(...)  = texto fixo
       val(...)  = valor digitado (fica vermelho no preview se estiver vazio)
       man(...)  = trecho a preencher manualmente depois (XXXX) */
  var MODELOS = {
    perda: {
      campos: ['placa', 'tec', 'data'],
      rotuloData: 'Horário/data da última posição',
      partes: function (v) { return [
        val(v.saud, 'saudação'), txt('!\n\nSenhores, estamos com a OS '), val(v.os, 'OS'),
        txt(' da placa '), val(v.placa, 'placa'),
        txt(' com alerta de perda de sinal. Conforme verificado, última posição no rastreador '),
        val(v.tec, 'tecnologia'), txt(' marca as '), val(v.dataHora, 'horário/data'),
        txt('. Conseguem solicitar ao motorista que ligue a chave na ignição para verificar se o sinal volta a posicionar?')
      ]; }
    },
    semEspelhamento: {
      campos: ['placa', 'tec'],
      rotuloData: 'Horário/data',
      partes: function (v) { return [
        val(v.saud, 'saudação'), txt('!\n\nSenhores, estamos com a OS '), val(v.os, 'OS'),
        txt(' da placa '), val(v.placa, 'placa'),
        txt(' com alerta de perda de sinal. Conforme verificado, veículo está sem espelhamento na '),
        val(v.tec, 'tecnologia'), txt('. Conseguem verificar por gentileza?')
      ]; }
    },
    atraso: {
      campos: ['cliente', 'data'],
      rotuloData: 'Horário do agendamento',
      partes: function (v) { return [
        val(v.saud, 'saudação'), txt('!\n\nSenhores, estamos com a OS '), val(v.os, 'OS'),
        txt(' com alerta de atraso de viagem. Conforme verificado, agendamento no cliente '),
        cli(v.cliente), txt(' estava para as '), val(v.hora, 'horário'),
        txt(', porém de acordo o rastreador não consta posições do veículo no local. Qual o motivo do atraso na operação?')
      ]; }
    },
    atrasoInicio: {
      campos: ['cliente', 'data'],
      rotuloData: 'Horário do agendamento',
      partes: function (v) { return [
        val(v.saud, 'saudação'), txt('!\n\nSenhores, estamos com a OS '), val(v.os, 'OS'),
        txt(' com alerta de atraso no início da viagem. Conforme verificado, agendamento para o cliente '),
        cli(v.cliente), txt(' estava para as '), val(v.hora, 'horário'),
        txt(', porém de acordo o rastreador posiciona em '), man('XXXX'),
        txt(' e do local atual até o cliente marcam cerca de '), man('XXXX'),
        txt(' minutos, o que geraria o atraso na operação. Qual o motivo do atraso em questão?')
      ]; }
    }
  };

  function txt(t) { return { t: t }; }
  function val(v, rotulo) { return v ? { t: v } : { t: '[' + rotulo + ']', miss: true }; }
  function man(t) { return { t: t, manual: true }; }
  function cli(v) { return v ? { t: v } : man('XXXX'); }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function saudacaoPorHorario() {
    var h = new Date().getHours();
    return h < 12 ? 'Bom dia' : (h < 18 ? 'Boa tarde' : 'Boa noite');
  }
  function definirSaudacao(valor) {
    saudRadios.forEach(function (r) { r.checked = (r.value === valor); });
  }
  function saudacaoSelecionada() {
    var sel = document.querySelector('input[name="saud"]:checked');
    return sel ? sel.value : '';
  }
  function agoraLocal() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
           'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function formatarData(valor) { // "2026-11-15T14:30" -> "15/11/2026" e "14:30"
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/.exec(valor || '');
    if (!m) return { hora: '', dataHora: '' };
    return { hora: m[4], dataHora: m[4] + ' do dia ' + m[3] + '/' + m[2] + '/' + m[1] };
  }

  function atualizar() {
    syncDisplay();
    var tipo = alerta.value;
    var modelo = MODELOS[tipo];

    boxPlaca.classList.toggle('hidden', !modelo || modelo.campos.indexOf('placa') < 0);
    boxTec.classList.toggle('hidden', !modelo || modelo.campos.indexOf('tec') < 0);
    $('boxData').classList.toggle('hidden', !!modelo && modelo.campos.indexOf('data') < 0);
    boxCliente.classList.toggle('hidden', !modelo || modelo.campos.indexOf('cliente') < 0);
    lblData.textContent = modelo ? modelo.rotuloData : 'Horário/data';

    btnCopiar.classList.remove('done');
    btnCopiar.textContent = 'COPIAR TEXTO';

    if (!modelo) {
      textoAtual = '';
      resultado.textContent = 'Selecione o tipo de alerta para gerar a mensagem.';
      resultado.classList.add('empty');
      dica.textContent = '';
      btnCopiar.disabled = true;
      return;
    }

    var f = formatarData(data.value);
    var v = {
      saud: saudacaoSelecionada(),
      os: os.value.replace(/\s+/g, '').toUpperCase(),
      placa: placa.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase(),
      tec: tec.value,
      cliente: cliente.value,
      hora: f.hora,
      dataHora: f.dataHora
    };

    var partes = modelo.partes(v);
    var faltando = false, temManual = false, plain = '';
    resultado.textContent = '';
    partes.forEach(function (p) {
      plain += p.t;
      if (p.miss) faltando = true;
      if (p.manual) temManual = true;
      if (p.miss || p.manual) {
        var s = document.createElement('span');
        s.className = p.miss ? 'miss' : 'manual';
        s.textContent = p.t;
        resultado.appendChild(s);
      } else {
        resultado.appendChild(document.createTextNode(p.t));
      }
    });
    resultado.classList.remove('empty');

    textoAtual = faltando ? '' : plain;
    btnCopiar.disabled = faltando;
    if (faltando) dica.textContent = 'Preencha os campos em vermelho para liberar a cópia.';
    else if (temManual) dica.textContent = 'Depois de colar, substitua os XXXX pelas informações que faltam.';
    else dica.textContent = '';
  }

  function mostrarStatus(msg) {
    status.textContent = msg;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { status.textContent = ''; }, 2500);
  }

  function copiarFallback(texto) {
    var ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }

  function copiar() {
    if (!textoAtual) return;
    var texto = textoAtual;
    function sucesso() {
      btnCopiar.classList.add('done');
      btnCopiar.textContent = 'COPIADO!';
      mostrarStatus('Mensagem copiada para a área de transferência.');
    }
    function falha() { mostrarStatus('Não foi possível copiar. Selecione o texto e use Ctrl+C.'); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(texto).then(sucesso, function () {
        copiarFallback(texto) ? sucesso() : falha();
      });
    } else {
      copiarFallback(texto) ? sucesso() : falha();
    }
  }

  function limpar() {
    os.value = '';
    placa.value = '';
    alerta.value = '';
    tec.value = '';
    cliente.value = '';
    data.value = '';
    definirSaudacao(saudacaoPorHorario());
    atualizar();
    mostrarStatus('Campos limpos.');
    os.focus();
  }

  os.addEventListener('input', function () {
    var pos = os.selectionStart;
    os.value = os.value.replace(/\s+/g, '').toUpperCase();
    os.setSelectionRange(pos, pos);
    atualizar();
  });
  placa.addEventListener('input', function () {
    var pos = placa.selectionStart;
    placa.value = placa.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    placa.setSelectionRange(pos, pos);
    atualizar();
  });
  [alerta, tec, data, cliente].forEach(function (el) {
    el.addEventListener('input', atualizar);
    el.addEventListener('change', atualizar);
  });
  saudRadios.forEach(function (r) { r.addEventListener('change', atualizar); });
  btnAgora.addEventListener('click', function () { data.value = agoraLocal(); atualizar(); });
  btnCopiar.addEventListener('click', copiar);
  btnLimpar.addEventListener('click', limpar);

  /* ---------- SELETOR DE DATA E HORÁRIO (tema escuro) ---------- */
  var dtTrigger = $('dtTrigger'), dtText = $('dtText'), dtPop = $('dtPop'),
      dtTitle = $('dtTitle'), dtGrid = $('dtGrid'), dtH = $('dtH'), dtM = $('dtM');
  var MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
               'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  var dtView = { y: 0, m: 0 }, dtSel = null;

  function syncDisplay() {
    var f = formatarData(data.value);
    if (f.dataHora) { dtText.textContent = f.dataHora.replace(' do dia ', ' '); dtText.className = ''; }
    else { dtText.textContent = 'Selecione data e horário'; dtText.className = 'dt-placeholder'; }
  }
  function agoraObj() {
    var d = new Date();
    return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate(), h: d.getHours(), mi: d.getMinutes() };
  }
  function paraIso(s) {
    return s.y + '-' + pad(s.m + 1) + '-' + pad(s.d) + 'T' + pad(s.h) + ':' + pad(s.mi);
  }
  function lerIso() {
    var p = (data.value || '').split('T');
    if (p.length === 2) {
      var dd = p[0].split('-'), tt = p[1].split(':');
      var s = { y: +dd[0], m: +dd[1] - 1, d: +dd[2], h: +tt[0], mi: +tt[1] };
      if (!isNaN(s.y + s.m + s.d + s.h + s.mi)) return s;
    }
    return agoraObj();
  }
  function lerTempo() {
    var h = parseInt(dtH.value, 10), mi = parseInt(dtM.value, 10);
    dtSel.h = isNaN(h) ? 0 : Math.min(23, Math.max(0, h));
    dtSel.mi = isNaN(mi) ? 0 : Math.min(59, Math.max(0, mi));
  }
  function mostrarTempo() { dtH.value = pad(dtSel.h); dtM.value = pad(dtSel.mi); }
  function desenharCalendario() {
    dtTitle.textContent = MESES[dtView.m] + ' ' + dtView.y;
    var primeiro = new Date(dtView.y, dtView.m, 1).getDay();
    var total = new Date(dtView.y, dtView.m + 1, 0).getDate();
    var hoje = agoraObj(), html = '';
    for (var i = 0; i < primeiro; i++) html += '<span></span>';
    for (var d = 1; d <= total; d++) {
      var cls = '';
      if (dtView.y === hoje.y && dtView.m === hoje.m && d === hoje.d) cls += ' today';
      if (dtView.y === dtSel.y && dtView.m === dtSel.m && d === dtSel.d) cls += ' sel';
      html += '<button type="button" class="' + cls.trim() + '" data-day="' + d + '">' + d + '</button>';
    }
    dtGrid.innerHTML = html;
  }
  function abrirPicker() {
    dtSel = lerIso();
    dtView = { y: dtSel.y, m: dtSel.m };
    desenharCalendario();
    mostrarTempo();
    dtPop.classList.remove('hidden');
    dtTrigger.setAttribute('aria-expanded', 'true');
  }
  function fecharPicker() {
    dtPop.classList.add('hidden');
    dtTrigger.setAttribute('aria-expanded', 'false');
  }
  function aplicar(valor) {
    data.value = valor;
    fecharPicker();
    atualizar();
    dtTrigger.focus();
  }

  dtTrigger.addEventListener('click', function () {
    if (dtPop.classList.contains('hidden')) abrirPicker(); else fecharPicker();
  });
  dtPop.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null;
    if (!b) return;
    if (b.hasAttribute('data-day')) {
      dtSel.y = dtView.y; dtSel.m = dtView.m; dtSel.d = +b.getAttribute('data-day');
      desenharCalendario();
      return;
    }
    var act = b.getAttribute('data-act');
    if (act === 'prev' || act === 'next') {
      dtView.m += (act === 'next' ? 1 : -1);
      if (dtView.m < 0) { dtView.m = 11; dtView.y--; }
      if (dtView.m > 11) { dtView.m = 0; dtView.y++; }
      desenharCalendario();
    } else if (act === 'h+' || act === 'h-' || act === 'm+' || act === 'm-') {
      lerTempo();
      if (act === 'h+') dtSel.h = (dtSel.h + 1) % 24;
      if (act === 'h-') dtSel.h = (dtSel.h + 23) % 24;
      if (act === 'm+') dtSel.mi = (dtSel.mi + 1) % 60;
      if (act === 'm-') dtSel.mi = (dtSel.mi + 59) % 60;
      mostrarTempo();
    } else if (act === 'agora') {
      aplicar(agoraLocal());
    } else if (act === 'limpar') {
      aplicar('');
    } else if (act === 'ok') {
      lerTempo();
      aplicar(paraIso(dtSel));
    }
  });
  [dtH, dtM].forEach(function (el) {
    el.addEventListener('input', function () { el.value = el.value.replace(/[^0-9]/g, ''); });
    el.addEventListener('blur', function () { if (dtSel) { lerTempo(); mostrarTempo(); } });
    el.addEventListener('focus', function () { el.select(); });
  });
  document.addEventListener('mousedown', function (e) {
    if (dtPop.classList.contains('hidden')) return;
    if (!dtPop.contains(e.target) && !dtTrigger.contains(e.target)) fecharPicker();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !dtPop.classList.contains('hidden')) { fecharPicker(); dtTrigger.focus(); }
  });

  definirSaudacao(saudacaoPorHorario());
  atualizar();
})();
