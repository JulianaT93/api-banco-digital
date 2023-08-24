const express = require('express');
const { validarSenhaBanco, validarSenhaUsuario } = require('./intermediarios-rotas/intermediarios');
const { listarContas, criarContaBancaria, atualizarCadastroDoUsuario, deletarConta, verificarSaldo, verificarExtrato, } = require('./controladores/contas');
const { depositarConta, sacarConta, transferirConta } = require('./controladores/transacoes');

const rotas = express();

rotas.get('/contas', validarSenhaBanco, listarContas)
rotas.post('/contas', criarContaBancaria)
rotas.put('/contas/:numeroConta/usuario', atualizarCadastroDoUsuario)
rotas.delete('/contas/:numeroConta', deletarConta)

rotas.post('/transacoes/depositar', depositarConta) // Alterar
rotas.post('/transacoes/sacar', sacarConta) // Alterar
rotas.post('/transacoes/transferir', transferirConta) // Alterar

rotas.get('/contas/saldo', validarSenhaUsuario, verificarSaldo)
rotas.get('/contas/extrato', validarSenhaUsuario, verificarExtrato)

module.exports = rotas;