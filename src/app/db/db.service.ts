import { Injectable } from '@angular/core'
import { UtilsModule } from '../utils/utils.module'
import * as json from '../../assets/data.json'

import { AngularIndexedDB } from 'angular2-indexeddb'

import { DB_NAME, DB_STORAGE_NAME } from '../app.constants'

@Injectable()
export class DBService {

    db: any
    dbVersion: number
    objectStore: any

    constructor (private Utils: UtilsModule) {
        this.dbVersion = new Date().getTime();
        this.db = new AngularIndexedDB(DB_NAME, this.dbVersion)
    }

    getList() {
        return this.db.openDatabase(this.dbVersion)
            .then(() => this.db.getAll(DB_STORAGE_NAME, null, {indexName: 'id', order: 'desc'}))
            .then(people => people)
    }

    createDb() {
        return this.createStore()
    }

    populateDb() {
        return this.db.openDatabase(this.dbVersion)
                    .then(() => {
                        this.initialData()
                            .forEach(el => this.db.add(DB_STORAGE_NAME, el))
                    })
    }

    clearDb() {
        return this.db.clear(DB_STORAGE_NAME)
    }

    createStore() {
        return new Promise((resolve, reject) => {
            this.db.openDatabase(this.dbVersion, evt => {

                if (<number>evt.oldVersion && <any>Object.keys(evt.target.result.objectStoreNames).length > 0) {
                    return this.getList()
                                .then((data) =>
                                    data.length > 0
                                    ? resolve({exists: true, populated: true})
                                    : resolve({exists: true, populated: false}))
                }

                const objectStore = evt.currentTarget.result.createObjectStore(
                    DB_STORAGE_NAME, { keyPath: 'id', autoIncrement: true }
                )

                objectStore.createIndex('id', 'id', { unique: true })
                objectStore.createIndex('name', 'name', { unique: false })
                objectStore.createIndex('age', 'age', { unique: false })

                return resolve({exists: true, populated: false})
            })
        })
    }

    addPerson(person) {
        return this.db.add(DB_STORAGE_NAME, {
            name: this.Utils.capitalize(person.name),
            age: person.age
        })
    }

    editPerson(person) {
        return this.db.getByKey(DB_STORAGE_NAME, person.id)
    }

    updatePerson(person) {
        return this.db.update(DB_STORAGE_NAME, {
            id: person.id,
            name: this.Utils.capitalize(person.name),
            age: person.age
        })
    }

    deletePerson(person) {
        return this.db.delete(DB_STORAGE_NAME, person.id)
    }

    sortBy(prop: string, direction: string) {
        return this.db.getAll(DB_STORAGE_NAME, null, {indexName: prop, order: direction})
    }

    initialData() {
        return <any>json
    }
}
