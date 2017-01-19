import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';
import {Observable} from "rxjs";


@Injectable()
export class PlansComponentService {
  // Observable string sources
  private missionAnnouncedSource = new Subject();
  private missionChange = new Subject();

  // Observable string streams
  missionAnnounced$ = this.missionAnnouncedSource.asObservable();
  missionAnnouncedChange$ = this.missionChange.asObservable();

  // Service message commands
  openPlan(mission: Object) {
    this.missionAnnouncedSource.next(mission);

  }

  changePlan(id:number){
    this.missionChange.next(id);
  }

}
