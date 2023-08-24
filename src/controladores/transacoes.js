const { format } = require('date-fns');

const { depositos, saques, transferencias } = require('../bancodedados');
const { buscarUsuarioPorNumeroDaConta, verificarSenhaUsuario } = require('../intermediarios-rotas/funcoes');

const depositarConta = (req, res) => {
    const { numero_conta, valor } = req.body;

    if (Number(valor) <= 0) {
        return res.status(400).json({ mensagem: "Depósito não realizado, pois o valor não pode ser zero ou número negativo. Verifique o valor informado e tente novamente." });
    }

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: "Depósito não realizado. Número da conta e valor são obrigatórios. Verifique os dados informados e tente novamente." });
    }

    const contaEncontrada = buscarUsuarioPorNumeroDaConta(numero_conta);

    if (contaEncontrada === undefined) {
        return res.status(404).json({ mensagem: "Depósito não realizado. Número da conta inválido. Verifique o número da conta informado e tente novamente." });
    }

    contaEncontrada.saldo += Number(valor);

    depositos.push({
        data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        numero_conta: numero_conta,
        valor: Number(valor),
    });

    return res.status(204).json();
};

const sacarConta = async (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    const contaEncontrada = buscarUsuarioPorNumeroDaConta(numero_conta);
    const senhaEncontrada = await verificarSenhaUsuario(numero_conta, senha);

    if (Number(valor) <= 0) {
        return res.status(400).json({ mensagem: "Saque não realizado, pois o valor não pode ser zero ou número negativo. Verifique o valor informado e tente novamente." });
    }

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ mensagem: "Saque não realizado. Número da conta, valor e senha são obrigatórios. Verifique os dados informados e tente novamente." });
    }

    if (contaEncontrada === undefined) {
        return res.status(404).json({ mensagem: "Saque não realizado. Número da conta inválido. Verifique o número da conta informado e tente novamente." });
    }

    if (senhaEncontrada === undefined) {
        return res.status(400).json({ mensagem: "Senha da conta inválida. Verifique a senha da conta informada e tente novamente." });
    }

    const saldoEncontrado = contaEncontrada.saldo;

    if (saldoEncontrado < Number(valor)) {
        return res.status(400).json({ mensagem: "Saldo em conta insuficiente para saque. Verifique seu saldo e tente novamente." })
    }

    contaEncontrada.saldo -= Number(valor);

    saques.push({
        numero_conta: numero_conta,
        valor: Number(valor),
        senha: senha
    });

    return res.status(204).json();
};

const transferirConta = async (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    const contaOrigemEncontrada = buscarUsuarioPorNumeroDaConta(numero_conta_origem);
    const contaDestinoEncontrada = buscarUsuarioPorNumeroDaConta(numero_conta_destino);
    const senhaEncontradaOrigem = await verificarSenhaUsuario(numero_conta_origem, senha);

    if (Number(valor) <= 0) {
        return res.status(400).json({ mensagem: "Transferência não realizada, pois o valor não pode ser zero ou número negativo. Verifique o valor informado e tente novamente." });
    }

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: "Transferência não realizada. Todos os dados são obrigatórios. Verifique os dados informados e tente novamente." });
    }

    if (contaOrigemEncontrada === undefined) {
        return res.status(404).json({ mensagem: "Transferência não realizada. Número da conta de origem inválido. Verifique o número da conta informado e tente novamente." });
    }

    if (contaDestinoEncontrada === undefined) {
        return res.status(404).json({ mensagem: "Transferência não realizada. Número da conta de destino inválido. Verifique o número da conta informado e tente novamente." });
    }

    if (senhaEncontradaOrigem === undefined) {
        return res.status(400).json({ mensagem: "Senha da conta de origem inválida. Verifique a senha da conta informada e tente novamente." });
    }

    const saldoEncontrado = contaOrigemEncontrada.saldo;

    if (saldoEncontrado < Number(valor)) {
        return res.status(400).json({ mensagem: "Saldo em conta insuficiente para transferência. Verifique seu saldo e tente novamente." })
    }

    contaOrigemEncontrada.saldo -= Number(valor);

    contaDestinoEncontrada.saldo += Number(valor);

    transferencias.push({
        data: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        numero_conta_origem: numero_conta_origem,
        numero_conta_destino: numero_conta_destino,
        valor: Number(valor)
    });

    return res.status(204).json();
};

module.exports = {
    depositarConta,
    sacarConta,
    transferirConta
}