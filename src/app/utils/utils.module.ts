import { NgModule } from '@angular/core'


@NgModule({})

export class UtilsModule {
    capitalize(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }
}
