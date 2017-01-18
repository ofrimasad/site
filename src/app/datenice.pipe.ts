import {Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'datenice'
})
export class DateNice implements PipeTransform {
    transform(tmpDate: string) : string {
      if(!tmpDate){
        return "";
      }

      var tmpDateN = tmpDate.split(".")[0];
      var dt = new Date(tmpDateN);

      var month = new Array();
      month[0] = "Jan";
      month[1] = "Feb";
      month[2] = "Mar";
      month[3] = "Apr";
      month[4] = "May";
      month[5] = "June";
      month[6] = "July";
      month[7] = "Aug";
      month[8] = "Sep";
      month[9] = "Oct";
      month[10] = "Nov";
      month[11] = "Dec";
      var n = month[dt.getMonth()];

      return n + " "+ dt.getDate()  + ", "+dt.getFullYear();
    }
}
