const { contas } = require('../bancodedados');

const verificarPreenchimentoDosDados = (dadosInformados) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = dadosInformados;

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return false;
    }

    return true;
}

const buscarUsuarioPorNumeroDaConta = (numeroContaInformado) => {
    const contaBuscada = contas.find((conta) => {
        return conta.numero === numeroContaInformado;
    });

    return contaBuscada;
}

const verificarExistenciaDoCpf = (cpfInformado) => {
    const contaSeExisteCpf = contas.find((conta) => {
        return conta.usuario.cpf === cpfInformado;
    })

    if (contaSeExisteCpf === undefined) {
        return undefined;
    }

    const cpfEncontrado = contaSeExisteCpf.usuario.cpf

    return cpfEncontrado;
};

const verificarExistenciaDoEmail = (emailInformado) => {
    const contaSeExisteEmail = contas.find((conta) => {
        return conta.usuario.email === emailInformado;
    })

    if (contaSeExisteEmail === undefined) {
        return undefined;
    }

    const emailEncontrado = contaSeExisteEmail.usuario.email

    return emailEncontrado;
};

const verificarSenhaUsuario = (contaInformada, senhaInformada) => {
    const contaBuscada = contas.find((conta) => {
        return conta.numero === contaInformada;
    });

    if (contaBuscada === undefined || contaBuscada.usuario.senha !== senhaInformada) {
        return undefined;
    }

    return contaBuscada.usuario.senha;
}

module.exports = {
    verificarPreenchimentoDosDados,
    verificarExistenciaDoCpf,
    verificarExistenciaDoEmail,
    buscarUsuarioPorNumeroDaConta,
    verificarSenhaUsuario
}