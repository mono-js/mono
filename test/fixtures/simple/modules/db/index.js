module.exports = () => {
	// Do nothing
}

module.exports.db = (name) => new Db(name)

class Db {

	constructor(name) {
		this.name = name
		this.docs = []
		this.id = 1
	}

	list() {
		return this.docs
	}

	get(id) {
		id = Number(id)
		const doc = this.docs.find((doc) => doc.id === id)
		if (!doc) throw new HttpError(`${this.name}-not-found`)
		return doc
	}

	save(doc) {
		doc = JSON.parse(JSON.stringify(doc))
		if (!doc) throw new HttpError(`${this.name}-empty`, 500)
		// If new doc
		if (!doc.id) {
			doc.createdAt = new Date()
			doc.id = this.id++
			this.docs.push(doc)
			return doc
		}
		// If update doc
		const docFound = this.get(doc.id)
		doc = Object.assign(docFound, doc)
		return doc
	}

	delete(id) {
		const doc = this.get(id)
		const index = this.docs.indexOf(doc)
		if (index !== -1) {
			this.docs.split(index, 1)
		}
		return true
	}

}
