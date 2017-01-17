import {Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'takefirst'
})
export class TakefirstPipe implements PipeTransform {
    transform(str: string) : string {

        return str.substr(0,str.indexOf(' '));
    }
}