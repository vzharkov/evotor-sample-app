import { Injectable } from '@angular/core';
import LokiCordovaFSAdapter from 'loki-cordova-fs-adapter';
import Loki from 'lokijs';

@Injectable()
export class DbService {
  db: any;
  issuesCollection: any;
  settingsCollection: any;
  commentsCollection: any;

  initDb(equipment_id: string): Promise<boolean> {
    if(!equipment_id) return Promise.reject(false);
    let adapter = new LokiCordovaFSAdapter({ "prefix": "loki" });
    this.db = new Loki(`evotor-okdesk-mobile.${equipment_id}.v1.json`, {
      autosave: true,
      autosaveInterval: 10000,
      adapter: adapter
    });
    return new Promise((resolve, reject) => {
      this.db.loadDatabase({}, () => {
        this.initSchema();
        resolve(true);
      });
    });
  }

  initSchema(){
    this.issuesCollection = this.db.getCollection('issues');
    if(!this.issuesCollection){
      this.issuesCollection = this.db.addCollection('issues', {
        unique: ['sequential_id']
      });
    }
    this.settingsCollection = this.db.getCollection('settings');
    if(!this.settingsCollection) {
      this.settingsCollection = this.db.addCollection('settings', {
        unique: ['name']
      });
    }
    this.commentsCollection = this.db.getCollection('comments');
    if(!this.commentsCollection){
      this.commentsCollection = this.db.addCollection('comments', {
        unique: ['id'],
        indeces: ['issue_sequential_id', 'created_at']
      });
    }
  }

  getIssues() {
    return this.issuesCollection.chain().data();
  }

  saveIssues(issues, clearStoredIssues = false) {
    if(clearStoredIssues){
      this.issuesCollection.clear();
      this.issuesCollection.constraints.unique.sequential_id.clear();
    }
    this.issuesCollection.insert(issues);
  }

  getIssue(sequentialId){
    return this.issuesCollection.by('sequential_id', sequentialId);
  }

  saveIssue(issue) {
    let createdIssue = this.issuesCollection.by('sequential_id', issue.sequential_id);
    if(createdIssue){
      for (let property in issue) {
        if (issue.hasOwnProperty(property)) {
          createdIssue[property] = issue[property];
        }
      }
      this.issuesCollection.update(createdIssue);
    }else{
      this.issuesCollection.insert(issue);
    }
  }

  getAccountSetting(settingName){
    return this.settingsCollection.findOne({ 'name': settingName});
  }

  getAccountSettings() {
    return this.settingsCollection.data;
  }

  saveAccountSettings(settings) {
    this.settingsCollection.clear();
    this.settingsCollection.constraints.unique.name.clear(); //delete indexes
    for(let key in settings) {
      if(settings.hasOwnProperty(key)){
        let newElement = {
          name: key,
          value: settings[key]
        }
        this.settingsCollection.insert(newElement);
      }
    }
  }

  getComments(issueId: number) {
    return this.commentsCollection.chain().
           find({ 'issue_sequential_id': issueId }).
           simplesort('created_at', false).data();
  }

  saveComments(issueId, comments) {
    this.commentsCollection.removeWhere({ 'issue_sequential_id': issueId });
    this.commentsCollection.insert(comments);
  }

  createComment(comment) {
    this.commentsCollection.insert(comment);
  }
}
