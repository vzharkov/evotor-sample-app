import { Injectable } from '@angular/core';
import { RequestService } from './request-service';

@Injectable()
export class IssuesService {

  constructor(public requestService: RequestService) {}

  public getIssues(options: any = {}) {
    return this.requestService.get('issues', options);
  }

  public getIssue(issueId: number) {
    return this.requestService.get(`issues/${issueId}/`);
  }

  public getIssuePriorities() {
    return this.requestService.get('issues/priorities');
  }

  public issueRate(params: any = {}) {
    return this.requestService.post('issues/rates', params);
  }

  public changeStatus(issueId: number, data: any) {
    let postUrl = `issues/${issueId}/statuses`;
    return this.requestService.post(postUrl, data);
  }

  public getIssueTypes() {
    return this.requestService.get('issues/work_types');
  }

  public getCustomParameters(work_type_id: number = null) {
    let params = work_type_id ? { work_type_id: work_type_id } : {};
    return this.requestService.get('issues/custom_parameters', params);
  }

  public createIssue(data: any){
    return this.requestService.postWithAttachments('issues', data);
  }

  public getComments(issueId: number) {
    return this.requestService.get(`issues/${issueId}/comments`);
  }

  public createComment(data: any){
    let path = `issues/${data.issueId}/comments`;
    return this.requestService.postWithAttachments(path, data);
  }
}
