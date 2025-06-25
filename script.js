const form = document.getElementById('form');
const itemInput = document.getElementById('itemInput');
const precoInput = document.getElementById('precoInput');
const categoriaInput = document.getElementById('categoriaInput');
const lista = document.getElementById('lista');
const totalDisplay = document.getElementById('total');
const limparListaBtn = document.getElementById('limparListaBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

function getEmoji(categoria) {
  switch (categoria) {
    case 'Frutas': return '🍎';
    case 'Bebidas': return '🥤';
    case 'Limpeza': return '🧼';
    case 'Outros': return '🛍️';
    default: return '🛒';
  }
}

let itens = JSON.parse(localStorage.getItem('itens')) || [];
let filtroAtivo = 'Todas';

function salvarItens() {
  localStorage.setItem('itens', JSON.stringify(itens));
}

function atualizarTotal() {
  const itensFiltrados = filtroAtivo === 'Todas' ? itens : itens.filter(i => i.categoria === filtroAtivo);
  const total = itensFiltrados.reduce((soma, item) => soma + parseFloat(item.preco), 0);
  totalDisplay.textContent = `💵 Total: R$ ${total.toFixed(2).replace('.', ',')}`;
}

function criarItemElemento(item, index) {
  const li = document.createElement('li');
  li.classList.add('fade-in');

  li.innerHTML = `
    <div class="item-card" data-index="${index}">
      <div class="item-text">
        <p class="item-nome">${getEmoji(item.categoria)} ${item.nome}</p>
        <p class="item-categoria">📁 ${item.categoria}</p>
        <p class="item-preco">💸 R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}</p>
      </div>
      <div class="item-actions">
        <button class="edit-btn" data-index="${index}" title="Editar item">✏️</button>
        <button class="remove-btn" data-index="${index}" title="Remover item">✖</button>
      </div>
    </div>
  `;

  return li;
}

function renderizarLista() {
  lista.innerHTML = '';

  // Mantém o índice real do item original junto
  const itensFiltradosComIndices = filtroAtivo === 'Todas'
    ? itens.map((item, idx) => ({ item, idx }))
    : itens
        .map((item, idx) => ({ item, idx }))
        .filter(({ item }) => item.categoria === filtroAtivo);

  itensFiltradosComIndices.forEach(({ item, idx }) => {
    const li = criarItemElemento(item, idx);
    lista.appendChild(li);
  });

  atualizarTotal();
}

function iniciarEdicao(index) {
  const item = itens[index];
  const li = lista.querySelector(`li:nth-child(${Array.from(lista.children).findIndex(child => Number(child.querySelector('.edit-btn, .remove-btn')?.getAttribute('data-index')) === index) + 1})`);

  if (!li) return;

  li.innerHTML = `
    <div class="item-card edit-mode">
      <input type="text" class="edit-nome" value="${item.nome}">
      <input type="number" class="edit-preco" step="0.01" value="${item.preco}">
      <select class="edit-categoria">
        <option value="Frutas" ${item.categoria === 'Frutas' ? 'selected' : ''}>Frutas</option>
        <option value="Bebidas" ${item.categoria === 'Bebidas' ? 'selected' : ''}>Bebidas</option>
        <option value="Limpeza" ${item.categoria === 'Limpeza' ? 'selected' : ''}>Limpeza</option>
        <option value="Outros" ${item.categoria === 'Outros' ? 'selected' : ''}>Outros</option>
      </select>
      <div class="item-actions">
        <button class="save-btn" data-index="${index}">Salvar</button>
        <button class="cancel-btn" data-index="${index}">Cancelar</button>
      </div>
    </div>
  `;
}

lista.addEventListener('click', function(event) {
  const index = event.target.getAttribute('data-index');
  if (index === null) return; // evita erros se clicar fora dos botões

  if (event.target.classList.contains('edit-btn')) {
    iniciarEdicao(Number(index));
  } else if (event.target.classList.contains('remove-btn')) {
    const li = event.target.closest('li');
    li.classList.add('removed');
    setTimeout(() => {
      itens.splice(Number(index), 1);
      salvarItens();
      renderizarLista();
    }, 300);
  } else if (event.target.classList.contains('save-btn')) {
    const li = lista.querySelector(`li:nth-child(${Array.from(lista.children).findIndex(child => Number(child.querySelector('.save-btn')?.getAttribute('data-index')) === Number(index)) + 1})`);

    const nomeEdit = li.querySelector('.edit-nome').value.trim();
    const precoEdit = li.querySelector('.edit-preco').value;
    const categoriaEdit = li.querySelector('.edit-categoria').value;

    if (nomeEdit && precoEdit && categoriaEdit) {
      itens[Number(index)] = { nome: nomeEdit, preco: precoEdit, categoria: categoriaEdit };
      salvarItens();
      renderizarLista();
    } else {
      alert('Preencha todos os campos para salvar a edição.');
    }
  } else if (event.target.classList.contains('cancel-btn')) {
    renderizarLista();
  }
});

form.addEventListener('submit', function(event) {
  event.preventDefault();

  const nome = itemInput.value.trim();
  const preco = precoInput.value;
  const categoria = categoriaInput.value;

  if (nome && preco && categoria) {
    itens.push({ nome, preco, categoria });
    salvarItens();
    renderizarLista();

    itemInput.value = '';
    precoInput.value = '';
    categoriaInput.value = '';
  }
});

limparListaBtn.addEventListener('click', function() {
  if (confirm('Tem certeza que deseja limpar toda a lista?')) {
    itens = [];
    salvarItens();
    renderizarLista();
  }
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroAtivo = btn.getAttribute('data-filter');
    renderizarLista();
  });
});

renderizarLista();
