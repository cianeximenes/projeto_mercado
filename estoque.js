// Banco de dados simulado
let estoque = [
    { 
        id: 1, 
        nome: "Arroz Camil 5kg", 
        precoCompra: 20.00, 
        precoVenda: 25.90, 
        quantidade: 50,
        dataAdicao: "01/08/2025",
        imagem: "./img/produto-placeholder.png"
    },
    { 
        id: 2, 
        nome: "Arroz Tio João 5kg", 
        precoCompra: 22.00, 
        precoVenda: 27.50, 
        quantidade: 30,
        dataAdicao: "01/08/2025",
        imagem: "./img/produto-placeholder.png"
    },
    { 
        id: 3, 
        nome: "Feijão Carioca 1kg", 
        precoCompra: 6.50, 
        precoVenda: 8.90, 
        quantidade: 40,
        dataAdicao: "30/07/2025",
        imagem: "./img/produto-placeholder.png"
    },
    { 
        id: 4, 
        nome: "Macarrão feito de ovo e farinha", 
        precoCompra: 3.20, 
        precoVenda: 4.50, 
        quantidade: 23,
        dataAdicao: "29/07/2025",
        imagem: "./img/produto-placeholder.png"
    },
    { 
        id: 5, 
        nome: "Óleo de Soja 900ml", 
        precoCompra: 5.50, 
        precoVenda: 7.20, 
        quantidade: 45,
        dataAdicao: "28/07/25",
        imagem: "./img/produto-placeholder.png"
    }
];

let produtoSelecionado = null; 

// Renderizar cards recentes (últimos 3 produtos adicionados)
function renderizarRecentes() {
    const container = document.getElementById('cards-recentes');
    const recentes = [...estoque].sort((a, b) => 
        new Date(b.dataAdicao.split('/').reverse().join('-')) - 
        new Date(a.dataAdicao.split('/').reverse().join('-'))
    ).slice(0, 3);

    container.innerHTML = recentes.map(p => `
        <div class="card-produto">
            <img src="${p.imagem}" alt="${p.nome}">
            <div class="card-produto-info">
                <div class="card-produto-nome">${p.nome}</div>
                <div class="card-produto-data">${p.dataAdicao}</div>
            </div>
            <div class="card-produto-acoes">
                <button class="btn-card btn-quantidade-card">
                    ${p.quantidade}x
                </button>
                <button class="btn-card btn-editar-card" onclick="editarProduto(${p.id})">
                    <i class="fa-solid fa-pen"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Renderizar estoque alfabético
function renderizarEstoqueAlfabetico() {
    const container = document.getElementById('estoque-alfabetico');
    
    // Agrupar por letra inicial
    const grupos = {};
    estoque.forEach(p => {
        const letra = p.nome[0].toUpperCase();
        if (!grupos[letra]) grupos[letra] = [];
        grupos[letra].push(p);
    });

    // Gerar HTML
    let html = '';
    Object.keys(grupos).sort().forEach((letra, index) => {
        const corClasse = index % 2 === 0 ? '' : 'verde';
        html += `
            <div class="area-alfabetica ${corClasse}">
                <div class="letra-divisor">${letra}-${String.fromCharCode(letra.charCodeAt(0) + 4)}:</div>
                <div class="produtos-alfabeticos">
                    ${grupos[letra].map(p => `
                        <div class="item-produto-alfabetico">
                            <span class="nome">${p.nome}</span>
                            <div class="acoes">
                                <button class="btn-card btn-quantidade-card">
                                    ${p.quantidade}x
                                </button>
                                <button class="btn-card btn-editar-card" onclick="editarProduto(${p.id})">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Autocompletar ao digitar
function buscarAutoComplete() {
    const input = document.getElementById('input-nome');
    const termo = input.value.toLowerCase().trim();
    const lista = document.getElementById('autocomplete-list');
    const badge = document.getElementById('badge-existente');

    if (termo.length < 2) {
        lista.style.display = 'none';
        badge.textContent = '';
        produtoSelecionado = null;
        return;
    }

    const resultados = estoque.filter(p => 
        p.nome.toLowerCase().includes(termo)
    );

    if (resultados.length > 0) {
        lista.innerHTML = resultados.map(p => `
            <div class="suggestion-item" onclick="selecionarProduto(${p.id})">
                <div class="suggestion-nome">${p.nome}</div>
                <div class="suggestion-info">
                    Estoque atual: ${p.quantidade} | 
                    Compra: R$ ${p.precoCompra.toFixed(2)} | 
                    Venda: R$ ${p.precoVenda.toFixed(2)}
                </div>
            </div>
        `).join('');
        lista.style.display = 'block';
    } else {
        lista.style.display = 'none';
        badge.textContent = '';
        produtoSelecionado = null;
    }
}

// Selecionar produto existente
function selecionarProduto(id) {
    produtoSelecionado = estoque.find(p => p.id === id);
    
    if (produtoSelecionado) {
        document.getElementById('input-nome').value = produtoSelecionado.nome;
        document.getElementById('input-preco-compra').value = produtoSelecionado.precoCompra.toFixed(2);
        document.getElementById('input-preco-venda').value = produtoSelecionado.precoVenda.toFixed(2);
        document.getElementById('input-quantidade').value = '';
        document.getElementById('input-quantidade').focus();
        
        document.getElementById('badge-existente').innerHTML = 
            '<span class="badge-existente">PRODUTO EXISTENTE - Será atualizado</span>';
        
        document.getElementById('autocomplete-list').style.display = 'none';
    }
}

// Salvar produto (INSERT ou UPDATE)
function salvarProduto() {
    const nome = document.getElementById('input-nome').value.trim();
    const precoCompra = parseFloat(document.getElementById('input-preco-compra').value);
    const precoVenda = parseFloat(document.getElementById('input-preco-venda').value);
    const quantidade = parseInt(document.getElementById('input-quantidade').value);

    if (produtoSelecionado) {
        // UPDATE: Produto já existe, somar quantidade
        produtoSelecionado.quantidade += quantidade;
        produtoSelecionado.precoCompra = precoCompra;
        produtoSelecionado.precoVenda = precoVenda;
        produtoSelecionado.dataAdicao = new Date().toLocaleDateString('pt-BR');
        
        alert(`✅ Estoque atualizado!\n"${nome}"\nNova quantidade: ${produtoSelecionado.quantidade}`);
        
        // TODO: Aqui você faria a chamada para a API Python
        // fetch('/api/estoque/update', {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         id: produtoSelecionado.id,
        //         quantidade_adicionar: quantidade,
        //         preco_compra: precoCompra,
        //         preco_venda: precoVenda
        //     })
        // });
    } else {
        // INSERT: Produto novo
        const novoProduto = {
            id: Math.max(...estoque.map(p => p.id)) + 1,
            nome: nome,
            precoCompra: precoCompra,
            precoVenda: precoVenda,
            quantidade: quantidade,
            dataAdicao: new Date().toLocaleDateString('pt-BR'),
            imagem: "./img/produto-placeholder.png"
        };
        
        estoque.push(novoProduto);
        alert(`✅ Produto adicionado com sucesso!\n"${nome}"`);
        
        // TODO: Aqui você faria a chamada para a API Python
        // fetch('/api/estoque/insert', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         nome: nome,
        //         preco_compra: precoCompra,
        //         preco_venda: precoVenda,
        //         quantidade: quantidade
        //     })
        // });
    }

    // Salvar no localStorage
    localStorage.setItem('estoqueXimenes', JSON.stringify(estoque));

    renderizarRecentes();
    renderizarEstoqueAlfabetico();
    fecharModalAdicionar();
}

// Editar produto existente
function editarProduto(id) {
    produtoSelecionado = estoque.find(p => p.id === id);
    
    if (produtoSelecionado) {
        document.getElementById('input-nome').value = produtoSelecionado.nome;
        document.getElementById('input-preco-compra').value = produtoSelecionado.precoCompra.toFixed(2);
        document.getElementById('input-preco-venda').value = produtoSelecionado.precoVenda.toFixed(2);
        document.getElementById('input-quantidade').value = produtoSelecionado.quantidade;
        
        document.getElementById('badge-existente').innerHTML = 
            '<span class="badge-existente">EDITANDO PRODUTO</span>';
        
        document.getElementById('modal-adicionar').style.display = 'flex';
    }
}

// Modal
function abrirModalAdicionar() {
    document.getElementById('modal-adicionar').style.display = 'flex';
    limparFormulario();
}

function fecharModalAdicionar() {
    document.getElementById('modal-adicionar').style.display = 'none';
    limparFormulario();
}

function limparFormulario() {
    document.getElementById('input-nome').value = '';
    document.getElementById('input-preco-compra').value = '';
    document.getElementById('input-preco-venda').value = '';
    document.getElementById('input-quantidade').value = '';
    document.getElementById('badge-existente').textContent = '';
    document.getElementById('autocomplete-list').style.display = 'none';
    produtoSelecionado = null;
}

function buscarProduto() {
    const termo = document.getElementById('busca-geral').value.toLowerCase().trim();
    
    if (!termo) {
        renderizarEstoqueAlfabetico();
        return;
    }

    const resultados = estoque.filter(p => 
        p.nome.toLowerCase().includes(termo)
    );

    const container = document.getElementById('estoque-alfabetico');
    
    if (resultados.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Nenhum produto encontrado</p>';
    } else {
        container.innerHTML = `
            <div class="area-alfabetica">
                <div class="letra-divisor">Resultados da busca:</div>
                <div class="produtos-alfabeticos">
                    ${resultados.map(p => `
                        <div class="item-produto-alfabetico">
                            <span class="nome">${p.nome}</span>
                            <div class="acoes">
                                <button class="btn-card btn-quantidade-card">
                                    ${p.quantidade}x
                                </button>
                                <button class="btn-card btn-editar-card" onclick="editarProduto(${p.id})">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Navegação
function voltarVendas() {
    window.location.href = 'compras.html';
}

function irHistorico() {
    window.location.href = 'historico.html';
}

// Modal de sair
document.getElementById('btn-sair').onclick = () => {
    document.getElementById('modal-sair').style.display = 'flex';
};

document.getElementById('btn-nao').onclick = () => {
    document.getElementById('modal-sair').style.display = 'none';
};

document.getElementById('btn-sim').onclick = () => {
    window.location.href = 'index.html';
};

// Fechar modal ao clicar fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        limparFormulario();
    }
};

// Inicialização
window.onload = function() {
    // Carregar estoque do localStorage se existir
    const estoqueLocal = localStorage.getItem('estoqueXimenes');
    if (estoqueLocal) {
        estoque = JSON.parse(estoqueLocal);
    }
    
    renderizarRecentes();
    renderizarEstoqueAlfabetico();
};