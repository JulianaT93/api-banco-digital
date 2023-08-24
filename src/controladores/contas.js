let { banco, contas, saques, depositos, transferencias } = require('../bancodedados');
const { verificarPreenchimentoDosDados, verificarExistenciaDoCpf, verificarExistenciaDoEmail, buscarUsuarioPorNumeroDaConta, verificarSenhaUsuario } = require('../intermediarios-rotas/funcoes');

const listarContas = (req, res) => {
    if (contas.length === 0) {
        return res.status(200).json(contas); //Informado código 200 ao invés de 204 porque no exemplo do desafio foi impresso [].
    };

    return res.status(200).json(contas);
};

const criarContaBancaria = async (req, res) => {
    let { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!verificarPreenchimentoDosDados(req.body)) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios. Verifique os dados informados e tente novamente." });
    };

    const cpfEncontrado = await verificarExistenciaDoCpf(cpf);

    const emailEncontrado = await verificarExistenciaDoEmail(email);

    if (cpfEncontrado !== undefined || emailEncontrado !== undefined) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o CPF ou e-mail informado. Verifique os dados e tente novamente." });
    };

    let { identificadorConta } = banco;

    contas.push({
        numero: String(identificadorConta++),
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha,
        }
    });

    banco.identificadorConta++;

    return res.status(201).json();
};

const atualizarCadastroDoUsuario = async (req, res) => {
    const { numeroConta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!verificarPreenchimentoDosDados(req.body)) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios. Verifique os dados informados e tente novamente." });
    };

    const contaEncontrada = buscarUsuarioPorNumeroDaConta(numeroConta);

    if (contaEncontrada === undefined) {
        return res.status(404).json({ mensagem: "Número da conta inválido. Verifique o número da conta informado e tente novamente." });
    };

    if (cpf !== contaEncontrada.usuario.cpf) {
        const cpfEncontrado = await verificarExistenciaDoCpf(cpf);

        if (cpfEncontrado !== undefined) {
            return res.status(400).json({ mensagem: "CPF já foi utilizado. Verifique o CPF informado e tente novamente." });
        };
    }

    if (email !== contaEncontrada.usuario.email) {
        const emailEncontrado = await verificarExistenciaDoEmail(email);

        if (emailEncontrado !== undefined) {
            return res.status(400).json({ mensagem: "E-mail já foi utilizado. Verifique o e-mail informado e tente novamente." });
        };
    };

    contaEncontrada.usuario.nome = nome;
    contaEncontrada.usuario.cpf = cpf;
    contaEncontrada.usuario.data_nascimento = data_nascimento;
    contaEncontrada.usuario.telefone = telefone;
    contaEncontrada.usuario.email = email;
    contaEncontrada.usuario.senha = senha;

    return res.status(203).json(); //Código informando que a alteração foi realizada com sucesso, conforme aula do prof. Guido.
};

const deletarConta = (req, res) => {
    const { numeroConta } = req.params;

    const contaEncontrada = buscarUsuarioPorNumeroDaConta(numeroConta);

    if (contaEncontrada === undefined) {
        return res.status(404).json({ mensagem: "Número da conta inválido. Verifique o número da conta informado e tente novamente." });
    };

    if (contaEncontrada.saldo > 0) {
        return res.status(400).json({ mensagem: "A conta possui saldo remanescente e só poderá ser excluída quando o saldo for zero." });
    };

    contas = contas.filter((contaEncontrada) => {
        return contaEncontrada.numero !== String(numeroConta);
    });

    return res.status(204).json();
};

const verificarSaldo = async (req, res) => {
    const { numero_conta, senha } = req.query;

    const contaEncontrada = buscarUsuarioPorNumeroDaConta(numero_conta);
    const senhaEncontrada = await verificarSenhaUsuario(numero_conta, senha);

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "Número da conta e senha são obrigatórios. Verifique os dados informados e tente novamente." });
    };

    if (contaEncontrada === undefined) {
        return res.status(404).json({ mensagem: "Número da conta inválido. Verifique o número da conta informado e tente novamente." });
    };

    if (senhaEncontrada === undefined) {
        return res.status(400).json({ mensagem: "Senha da conta inválida. Verifique a senha da conta informada e tente novamente." });
    };

    const saldoEncontrado = contaEncontrada.saldo;

    return res.status(200).json(`Saldo: ${saldoEncontrado}`);


    // if (contaEncontrada !== undefined && contaComSenhaEncontrada !== undefined) {
    //     return res.status(200).json(`Saldo: ${saldoEncontrado}`);
    // };
};

const verificarExtrato = async (req, res) => {
    const { numero_conta, senha } = req.query;

    const contaOrigemEncontrada = buscarUsuarioPorNumeroDaConta(numero_conta);
    const senhaEncontradaOrigem = await verificarSenhaUsuario(numero_conta, senha);

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "Número da conta e senha são obrigatórios. Verifique os dados informados e tente novamente." });
    };

    if (contaOrigemEncontrada === undefined) {
        return res.status(400).json({ mensagem: "Número da conta inválido. Verifique o número da conta informado e tente novamente." });
    };

    if (senhaEncontradaOrigem === undefined) {
        return res.status(400).json({ mensagem: "Senha da conta inválida. Verifique a senha da conta informada e tente novamente." });
    };

    const extratoDaConta = {
        depositos: depositos.filter((conta) => conta.numero_conta === numero_conta),
        saques: saques.filter((conta) => conta.numero_conta === numero_conta),
        transferenciasEnviadas: transferencias.filter((conta) => conta.numero_conta_origem === numero_conta),
        transferenciasRecebidas: transferencias.filter((conta) => conta.numero_conta_destino === numero_conta)
    };

    res.status(200).json({ extratoDaConta });
};

module.exports = {
    listarContas,
    criarContaBancaria,
    atualizarCadastroDoUsuario,
    deletarConta,
    verificarSaldo,
    verificarExtrato,
};