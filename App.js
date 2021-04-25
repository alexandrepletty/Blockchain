// --- Dependency
const yargs 		= require('yargs')
const chalk 		= require('chalk')
const idGenerator	= require('id-16')
const fs			= require('fs')

// --- Json data
const WJ = require('./data/wallet.json')
const TJ = require('./data/transaction.json')

// --- Blockchain
const {Wallet, Chain} = require('./core/blockchain')

/**
 * Create account
 */
yargs.command('wallet', 'Create wallet', {
		create: {
			describe: 'Name wallet',
			demandOption: true,
			type: 'string'
		}
	},
	args => {
		// --- Argument
		const {create} = args

		// --- New Wallet
		const wallet = new Wallet()

		// --- Check if account exit
		if(!WJ.hasOwnProperty(create.toLowerCase())) {
			// --- Create object account
			WJ[create.toLowerCase()] = {
				uid: idGenerator(4),
				name: create,
				money: 50,
				public: wallet.publicKey,
				private: wallet.privateKey
			}

			// --- Add account
			fs.writeFileSync('./data/wallet.json', JSON.stringify(WJ, null, 4))

			// --- Information console
			console.log(`${chalk.greenBright('___________________________')}`)
			console.log(`${chalk.greenBright(' ')}`)
			console.log(`${chalk.greenBright('Le compte a été créé.')}`)
			console.log(`${chalk.greenBright('___________________________')}`)
		}else {
			// --- Information console
			console.log(`${chalk.redBright('___________________________')}`)
			console.log(`${chalk.redBright(' ')}`)
			console.log(`${chalk.redBright('Le compte existe.')}`)
			console.log(`${chalk.redBright('___________________________')}`)
		}
	}
).argv

/**
 * Pay account to account
 */
yargs.command('pay', 'Send money', {
		amount: {
			describe: 'Amount',
			demandOption: true,
			type: 'int'
		},
		me: {
			describe: 'My account',
			demandOption: true,
			type: 'string'
		},
		account: {
			describe: 'Account transaction',
			demandOption: true,
			type: 'string'
		}
	},
	args => {
		const {amount, me, account} = args

		if(WJ.hasOwnProperty(me.toLowerCase()) && WJ.hasOwnProperty(account.toLowerCase())) {
			if(WJ[me].money > 0 && WJ[me].money >= amount) {
				// --- New Wallet
				const wallet = new Wallet()
				wallet.sendMoney(amount, WJ[me].public, WJ[account].public)

				// --- Pay
				WJ[me] = {
					...WJ[me],
					money: WJ[me].money - amount
				}

				WJ[account] = {
					...WJ[account],
					money: WJ[account].money + amount
				}

				// --- Update wallet
				fs.writeFileSync('./data/wallet.json', JSON.stringify(WJ, null, 4))

				// --- Transaction
				Chain.instance.chain.map(i => {
					if(i.transaction.payer.length > 1 || i.transaction.payee.length > 1) {
						console.log(i)

						TJ[idGenerator(4)] = i

						// --- Add transaction
						fs.writeFileSync('./data/transaction.json', JSON.stringify(TJ, null, 4))
					}
				})

				// --- Information console
				console.log(`${chalk.greenBright('___________________________')}`)
				console.log(`${chalk.greenBright(' ')}`)
				console.log(`${chalk.white(`La transaction de`)} ${chalk.blueBright(amount)} ${chalk.white(`a été effectué à`)} ${chalk.greenBright(account)}`)
				console.log(`${chalk.greenBright('___________________________')}`)
			}else {
				// --- Information console
				console.log(`${chalk.redBright('___________________________')}`)
				console.log(`${chalk.redBright(' ')}`)
				console.log(`${chalk.redBright('Vous n\'avez pas les fonds suffisant.')}`)
				console.log(`${chalk.redBright('___________________________')}`)
			}
		}else {
			// --- Information console
			console.log(`${chalk.redBright('___________________________')}`)
			console.log(`${chalk.redBright(' ')}`)
			console.log(`${chalk.redBright('Transaction invalide.')}`)
			console.log(`${chalk.redBright('___________________________')}`)
		}
	}
).argv
