// Dados da venda
let produtos = [];
let contadorProdutos = 0;

// Carregar estoque do localStorage
function carregarEstoque() {
    const estoqueLocal = localStorage.getItem('estoqueXimenes');
    return estoqueLocal ? JSON.parse(estoqueLocal) : [];
}

// Inicializa sem produtos
window.onload = function() {
    configurarModalSair();
    configurarBuscaComAutoComplete();
    renderizarProdutos(); // Renderiza estado vazio inicial
};

// Configurar modal de sair
function configurarModalSair() {
    const btnSair = document.getElementById('btn-sair');
    const modal = document.getElementById('modal-sair');
    const btnNao = document.getElementById('btn-nao');
    const btnSim = document.getElementById('btn-sim');

    // Abre modal ao clicar no ícone de sair
    btnSair.onclick = function() {
        modal.style.display = 'flex';
    };

    // Fecha modal e continua na página
    btnNao.onclick = function() {
        modal.style.display = 'none';
    };

    // Redireciona para index.html
    btnSim.onclick = function() {
        window.location.href = 'index.html';
    };

    // Fecha modal ao clicar fora
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// Adiciona produto vazio à lista
function adicionarProdutoVazio() {
    contadorProdutos++;
    const produto = {
        id: contadorProdutos,
        nome: `PRODUTO x${contadorProdutos}`,
        quantidade: 1,
        preco: 0
    };
    produtos.push(produto);
    renderizarProdutos();
}

// Renderiza lista de produtos
function renderizarProdutos() {
    const lista = document.getElementById('lista-produtos');
    
    if (produtos.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #999; padding: 40px; font-style: italic; margin: 0;">Nenhum produto adicionado. Use a busca abaixo para adicionar produtos.</p>';
        lista.style.display = 'flex';
        lista.style.alignItems = 'center';
        lista.style.justifyContent = 'center';
        calcularTotal();
        return;
    }
    
    lista.style.display = 'block';
    lista.innerHTML = '';

    produtos.forEach(produto => {
        const div = document.createElement('div');
        div.className = 'produto-item';
        div.innerHTML = `
            <button class="btn-remover" onclick="removerProduto(${produto.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
            
            <span class="produto-nome">${produto.nome}:</span>
            
            <div class="controles-quantidade">
                <button class="btn-quantidade" onclick="alterarQuantidade(${produto.id}, -1)">
                    <i class="fa-solid fa-minus"></i>
                </button>
                <span class="quantidade-display">${produto.quantidade}</span>
                <button class="btn-quantidade" onclick="alterarQuantidade(${produto.id}, 1)">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
            
            <div class="preco-produto">
                <span>R$</span>
                <input type="number" 
                       step="0.01" 
                       value="${produto.preco.toFixed(2)}"
                       onchange="alterarPreco(${produto.id}, this.value)"
                       placeholder="0,00">
            </div>
        `;
        lista.appendChild(div);
    });

    calcularTotal();
}

// Remove produto
function removerProduto(id) {
    produtos = produtos.filter(p => p.id !== id);
    renderizarProdutos();
}

// Altera quantidade
function alterarQuantidade(id, delta) {
    const produto = produtos.find(p => p.id === id);
    if (produto) {
        produto.quantidade = Math.max(1, produto.quantidade + delta);
        renderizarProdutos();
    }
}

// Altera preço
function alterarPreco(id, novoPreco) {
    const produto = produtos.find(p => p.id === id);
    if (produto) {
        produto.preco = parseFloat(novoPreco) || 0;
        calcularTotal();
    }
}

// Calcula total da venda
function calcularTotal() {
    const total = produtos.reduce((sum, p) => sum + (p.quantidade * p.preco), 0);
    document.getElementById('valor-total').textContent = `R$ ${total.toFixed(2)}`;
}

// Configurar busca com autocompletar
function configurarBuscaComAutoComplete() {
    const inputBusca = document.getElementById('busca-produto');
    const container = document.createElement('div');
    container.id = 'autocomplete-venda';
    container.style.cssText = `
        position: absolute;
        background: white;
        border: 2px solid #4c9132;
        border-radius: 10px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        display: none;
        width: calc(100% - 60px);
    `;
    
    inputBusca.parentElement.style.position = 'relative';
    inputBusca.parentElement.insertBefore(container, inputBusca.nextSibling);
    
    inputBusca.addEventListener('input', function() {
        const termo = this.value.toLowerCase().trim();
        
        if (termo.length < 2) {
            container.style.display = 'none';
            return;
        }
        
        const estoque = carregarEstoque();
        const resultados = estoque.filter(p => 
            p.nome.toLowerCase().includes(termo) && p.quantidade > 0
        );
        
        if (resultados.length > 0) {
            container.innerHTML = resultados.map(p => `
                <div class="suggestion-item-venda" 
                     onclick="selecionarProdutoEstoque(${p.id})"
                     style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #f0f0f0; transition: 0.2s;">
                    <div style="font-weight: 700; color: #26411d;">${p.nome}</div>
                    <div style="font-size: 0.85rem; color: #666; margin-top: 3px;">
                        Estoque: ${p.quantidade} | Preço: R$ ${p.precoVenda.toFixed(2)}
                    </div>
                </div>
            `).join('');
            container.style.display = 'block';
            
            // Adicionar hover
            document.querySelectorAll('.suggestion-item-venda').forEach(item => {
                item.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#e8f5e0';
                });
                item.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'white';
                });
            });
        } else {
            container.style.display = 'none';
        }
    });
    
    // Fechar ao clicar fora
    document.addEventListener('click', function(e) {
        if (!inputBusca.contains(e.target) && !container.contains(e.target)) {
            container.style.display = 'none';
        }
    });
}

// Selecionar produto do estoque
function selecionarProdutoEstoque(idEstoque) {
    const estoque = carregarEstoque();
    const produtoEstoque = estoque.find(p => p.id === idEstoque);
    
    if (produtoEstoque && produtoEstoque.quantidade > 0) {
        contadorProdutos++;
        const novoProduto = {
            id: contadorProdutos,
            idEstoque: produtoEstoque.id,
            nome: produtoEstoque.nome,
            quantidade: 1,
            preco: produtoEstoque.precoVenda
        };
        
        produtos.push(novoProduto);
        renderizarProdutos();
        
        // Limpa busca
        document.getElementById('busca-produto').value = '';
        document.getElementById('autocomplete-venda').style.display = 'none';
    }
}

// Busca produto 
function buscarProduto() {
    const termoBusca = document.getElementById('busca-produto').value.trim();
    
    if (termoBusca === '') {
        alert('Digite o nome de um produto para buscar');
        return;
    }

    const estoque = carregarEstoque();
    const produtoEncontrado = estoque.find(p => 
        p.nome.toLowerCase() === termoBusca.toLowerCase() && p.quantidade > 0
    );
    
    if (produtoEncontrado) {
        selecionarProdutoEstoque(produtoEncontrado.id);
    } else {
        // Se não encontrar no estoque, adiciona produto manual
        contadorProdutos++;
        const novoProduto = {
            id: contadorProdutos,
            nome: termoBusca,
            quantidade: 1,
            preco: 0
        };
        
        produtos.push(novoProduto);
        renderizarProdutos();
        document.getElementById('busca-produto').value = '';
    }
}

// Permite buscar ao pressionar Enter
document.addEventListener('DOMContentLoaded', function() {
    const inputBusca = document.getElementById('busca-produto');
    if (inputBusca) {
        inputBusca.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                buscarProduto();
            }
        });
    }
});

// Finaliza venda e atualiza estoque
function finalizarVenda() {
    const metodoPagamento = document.getElementById('metodo-pagamento').value;
    const descricao = document.getElementById('descricao').value;
    
    if (produtos.length === 0) {
        alert('Adicione pelo menos um produto à venda!');
        return;
    }

    const temProdutoComPreco = produtos.some(p => p.preco > 0);
    if (!temProdutoComPreco) {
        alert('Adicione o preço de pelo menos um produto!');
        return;
    }

    if (!metodoPagamento) {
        alert('Selecione um método de pagamento!');
        return;
    }

    // Verificar estoque disponível
    const estoque = carregarEstoque();
    for (let produto of produtos) {
        if (produto.idEstoque) {
            const produtoEstoque = estoque.find(p => p.id === produto.idEstoque);
            if (produtoEstoque && produtoEstoque.quantidade < produto.quantidade) {
                alert(`Estoque insuficiente para "${produto.nome}"!\nDisponível: ${produtoEstoque.quantidade}\nSolicitado: ${produto.quantidade}`);
                return;
            }
        }
    }

    // Dados da venda
    const venda = {
        produtos: produtos,
        metodoPagamento: metodoPagamento,
        descricao: descricao,
        total: produtos.reduce((sum, p) => sum + (p.quantidade * p.preco), 0),
        data: new Date().toISOString()
    };

    // enviar para a API
    console.log('Venda finalizada:', venda);
    
    // Confirmação
    if (confirm(`Confirmar venda no valor de R$ ${venda.total.toFixed(2)}?`)) {
        // Atualizar estoque 
        produtos.forEach(produto => {
            if (produto.idEstoque) {
                const produtoEstoque = estoque.find(p => p.id === produto.idEstoque);
                if (produtoEstoque) {
                    produtoEstoque.quantidade -= produto.quantidade;
                }
            }
        });
        
        // Salvar estoque atualizado
        localStorage.setItem('estoqueXimenes', JSON.stringify(estoque));
        
        // Salvar venda no histórico
        const vendasAnteriores = localStorage.getItem('vendasXimenes');
        const vendas = vendasAnteriores ? JSON.parse(vendasAnteriores) : [];
        
        // Adicionar custo dos produtos para cálculo de lucro
        venda.produtos = venda.produtos.map(p => {
            if (p.idEstoque) {
                const prodEstoque = estoque.find(e => e.id === p.idEstoque);
                return {
                    ...p,
                    precoCusto: prodEstoque ? prodEstoque.precoCompra : 0
                };
            }
            return { ...p, precoCusto: 0 };
        });
        
        vendas.push(venda);
        localStorage.setItem('vendasXimenes', JSON.stringify(vendas));
        
        alert('Venda registrada com sucesso!\nEstoque atualizado automaticamente.');
        
        // TODO: Quando conectar com Python:
        // fetch('/api/vendas/registrar', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(venda)
        // });
        
        // Limpa formulário
        produtos = [];
        contadorProdutos = 0;
        document.getElementById('metodo-pagamento').value = '';
        document.getElementById('descricao').value = '';
        
        // Volta para o estado vazio
        renderizarProdutos();
    }
}

// Navegação entre páginas
document.addEventListener('DOMContentLoaded', function() {
    const botoesMenu = document.querySelectorAll('.btn-menu');
    
    botoesMenu.forEach((botao, index) => {
        botao.addEventListener('click', function() {
            // Remove classe ativo de todos
            botoesMenu.forEach(btn => btn.classList.remove('ativo'));
            
            // Adiciona classe ativo no botão clicado
            this.classList.add('ativo');
            
            // Navega conforme o botão
            switch(index) {
                case 0:
                    break;
                case 1: 
                    window.location.href = 'estoque.html';
                    break;
                case 2: 
                    window.location.href = 'historico.html';
                    break;
            }
        });
    });
});