import { Component } from '@angular/core'
import { OnInit } from '@angular/core'
import { ViewEncapsulation } from '@angular/core'
import { ViewChild } from '@angular/core'

import { MyList } from './db.class'
import { DBService } from './db.service'

@Component ({
  selector: 'app-db',
  templateUrl: './db.component.html',
  styleUrls: ['./db.component.css'],
  providers: [DBService],
  encapsulation: ViewEncapsulation.None,
})

export class DBComponent implements OnInit {
    elements: MyList[]
    message: Message
    model: any
    sorter: any
    @ViewChild('formComponent') form: any

    constructor (private DBService: DBService) {
        this.sorter = { prop: 'id', direction: 'desc' }
    }

    ngOnInit(): void {
        this.setDefaults()
        this.DBService.createDb()
            .then((data) =>  data['populated'] ? this.getList() : this.displaySuccessMessage('DB exists. Click Populate DB or use form to insert data.'))
            .catch((e) => this.displayErrorMessage(e))
    }

    getList() {
        return this.DBService.getList()
            .then(data => {
                this.elements = data
                this.setDefaults()
            })
            .catch(e => this.displayErrorMessage(e))
    }

    onSubmit() {
        return this.model.id ? this.update(this.model) : this.add()
    }

    setDefaults() {
        this.form.reset()
        this.model = new DBModel(null, null, null)
    }

    add() {
        this.DBService.addPerson(new DBModel(null, this.model.name, this.model.age))
            .then(() => this.getList())
            .then(() => this.displaySuccessMessage('Added'))
            .catch((e) => this.displayErrorMessage(e))
    }

    remove(item) {
        this.DBService.deletePerson(item)
            .then(() => this.getList())
            .then(() => this.displaySuccessMessage('Removed'))
            .catch((e) => this.displayErrorMessage(e))
    }

    edit(item) {
        return this.DBService.editPerson(item)
            .then(data => this.model = data)
    }

    update(item) {
        return this.DBService.updatePerson(item)
            .then(() => this.getList())
            .then(() => this.displaySuccessMessage('Updated'))
            .catch((e) => this.displayErrorMessage(e))
    }

    dismiss() {
        this.message = null
    }

    populateDb() {
        this.DBService.populateDb()
            .then(() => this.getList())
            .then(() => this.displaySuccessMessage('DB populated'))
    }

    clearDb() {
        this.DBService.clearDb()
            .then(() => {
                this.setDefaults()
                this.displaySuccessMessage('DB cleared')
                this.elements.length = 0;
            })
            .catch((e) => this.displayErrorMessage(e))
    }

    sortBy(prop: string, direction: string) {
        this.DBService.sortBy(prop, direction)
            .then(data => {
                this.elements = data
                this.sorter = { prop: prop, direction: direction }
            })
    }

    //@TODO this can be refactored to own component
    displaySuccessMessage(message = 'Operation succesfull') {
        this.message = new Message('alert-success', message)
    }

    displayErrorMessage(e = 'Something went wrong') {
        this.message = new Message('alert-danger', `Something went wrong: ${e}`)
    }
}

class DBModel {
    constructor(
        public id: number,
        public name: string,
        public age: number,
    ) {}
}

class Message {
    constructor(
        public type: string,
        public text: string
    ) {}
}
