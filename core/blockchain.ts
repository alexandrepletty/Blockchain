// --- Modules
import * as crypto from 'crypto'

// --- Transaction
export class Transaction {
	constructor(
		public amount: number,
		public payer: string,
		public payee: string
	) {}

	toString() {
		return JSON.stringify(this)
	}
}

// --- Block
export class Block {
	public nonce = Math.round(Math.random() * 999999999)

	constructor(
		public prevHash: string,
		public transaction: Transaction,
		public ts = Date.now()
	) {}

	get hash() {
		const str = JSON.stringify(this)
		const hash = crypto.createHash('SHA256')
		hash.update(str).end()
		return hash.digest('hex')
	}
}

// --- Chain
export class Chain {
	public static instance = new Chain()

	chain: Block[]

	constructor() {
		this.chain = [
			new Block('', new Transaction(0, '', ''))
		]
	}

	get lastBlock() {
		return this.chain[this.chain.length - 1]
	}

	mine(nonce: number) {
		let solution = 1
		console.log('⛏ mining...')

		while(true) {
			const hash = crypto.createHash('MD5')
			hash.update((nonce + solution).toString()).end()

			const attempt = hash.digest('hex')

			if(attempt.substr(0,4) === '0000'){
				console.log(`Solved: ${solution}`)
				return solution
			}

			solution += 1
		}
	}

	addBlock(transaction: Transaction, signature: Buffer) {
		const verify = crypto.createVerify('SHA256')
		verify.update(transaction.toString())

		const isValid = verify.verify(transaction.payer, signature)

		if (isValid) {
			const newBlock = new Block(this.lastBlock.hash, transaction)
			this.mine(newBlock.nonce)
			this.chain.push(newBlock)
		}
	}
}

// --- Wallet
export class Wallet {
	public publicKey: string
	public privateKey: string

	constructor() {
		const keypair = crypto.generateKeyPairSync('rsa', {
			modulusLength: 2048,
			publicKeyEncoding: { type: 'spki', format: 'pem' },
			privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
		})

		this.privateKey = keypair.privateKey
		this.publicKey = keypair.publicKey
	}

	sendMoney(amount: number, payeePublicKey: string) {
		const transaction = new Transaction(amount, this.publicKey, payeePublicKey)

		const sign = crypto.createSign('SHA256')
		sign.update(transaction.toString()).end()

		const signature = sign.sign(this.privateKey)
		Chain.instance.addBlock(transaction, signature)
	}
}