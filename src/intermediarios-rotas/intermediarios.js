const { banco } = require('../bancodedados');
const { buscarUsuarioPorNumeroDaConta, verificarSenhaUsuario } = require('./funcoes')

const validarSenhaBanco = (req, res, next) => {
    const { senha_banco } = req.query;
    if (!senha_banco) {
        return res.status(401).json({ mensagem: "A senha é obrigatória. Por favor, informe a senha e tente novamente." });
    }

    if (senha_banco !== banco.senha) {
        return res.status(401).json({ mensagem: "A senha está incorreta. Por favor, digite a senha novamente." });
    }

    next();
};

const validarSenhaUsuario = async (req, res, next) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "O número e a senha da conta são obrigatórios. Verifique os dados informados e tente novamente." })
    }

    const contaEncontrada = buscarUsuarioPorNumeroDaConta(numero_conta);
    const senhaEncontrada = await verificarSenhaUsuario(numero_conta, senha);


    if (contaEncontrada === undefined) {
        return res.status(400).json({ mensagem: "Número da conta inválido. Verifique o número da conta informado e tente novamente." });
    }

    if (senhaEncontrada === undefined) {
        return res.status(400).json({ mensagem: "Senha da conta inválida. Verifique a senha da conta informada e tente novamente." });
    }

    next()
};


module.exports = {
    validarSenhaBanco,
    validarSenhaUsuario
}