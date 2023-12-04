import {Component} from '@angular/core';

import {DocumentsService} from "./documents.service";
import {Document} from "./document";
import {Subscription} from "rxjs";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";


@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent {
  // @ts-ignore
  documents: Document[];

  isMapAvailable = false
  isStatuteAvailable = false


  addFileForm: FormGroup;
  addListForm: FormGroup;
  showAddDocumentForm = false;
  showAddMapDocumentForm = false;
  showAddStatuteDocumentForm = false;
  showAddListForm = false;
  selectedFile: File | null = null;
  selectedMapFile: File | null = null;
  selectedStatuteFile: File | null = null;

  constructor(formBuilder: FormBuilder, private documentsService: DocumentsService) {
    this.initData()
    this.addFileForm = formBuilder.group({
      name: ['', [
        Validators.required,
      ]],
      file: ['', [
        Validators.required,
      ]]
    })
    this.addListForm = formBuilder.group({
      name: ['', [
        Validators.required,
      ]],
    })
  }

  initData() {
    this.documentsInit()
    this.mapInit()
    this.statueInit()
  }

  documentsInit(){
    this.documentsService.getDocuments()
      .subscribe((result: Document[]) => {
        this.documents=result
      });
  }

  mapInit() {
    this.documentsService.isMapAvailable()
      .subscribe((result: boolean) => {
        this.isMapAvailable = result;
      });
  }

  statueInit() {
    this.documentsService.isStatuteAvailable()
      .subscribe((result: boolean) => {
        this.isStatuteAvailable = result;
      });
  }


  errorMessages = {
    name: [
      {type: 'required', message: 'Proszę podać nazwę'},
    ],
    file: [
      {type: 'required', message: 'Proszę podać plik'},
    ],
  }

  validationErrors(controlName: string, form: FormGroup): any[] {
    let errors = []
    // @ts-ignore
    for (let error of this.errorMessages[controlName]) {
      if (form.get(controlName)?.hasError(error.type)) {
        errors.push(error);
      }
    }
    return errors;
  }


  downloadMap() {
    this.downloadFile('map')
  }

  downloadStatue() {
    this.downloadFile('statue')
  }

  downloadFile(idDocument: string) {
    let filePath: string = ''
    const subscription: Subscription = this.documentsService.downloadDocumentSimulate(idDocument)
      .subscribe((result: string) => {
        filePath = result;
        window.open(filePath, '_blank');
      });
  }

  toggleAddDocumentForm() {
    this.showAddDocumentForm = !this.showAddDocumentForm;
    this.addFileForm.reset()
  }

  toggleAddListForm() {
    this.showAddListForm = !this.showAddListForm;
    this.addListForm.reset()
  }

  toggleAddMapDocumentForm() {
    this.showAddMapDocumentForm = !this.showAddMapDocumentForm;
  }

  toggleAddStatuteDocumentForm() {
    this.showAddStatuteDocumentForm = !this.showAddStatuteDocumentForm;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onMapFileSelected(event: any) {
    this.selectedMapFile = event.target.files[0];
  }

  onStatuteFileSelected(event: any) {
    this.selectedStatuteFile = event.target.files[0];
  }


  addNewDocument() {
    if (this.addFileForm.valid && this.selectedFile) {
      const newTitle: string = this.addFileForm.get('name')?.value;
      const id = generateRandomID();
      const newDocument: Document = {id: id, title: newTitle};
      this.documents.push(newDocument);
      this.documentsService.uploadDocument(this.selectedFile, id).subscribe((result: any) => {
        this.documentsService.updateDocumentsList(this.documents).subscribe(response => {
          console.log('Zaktualizowano dane: ', response);
        });
        this.showAddDocumentForm = false
      });
    }
  }

  addNewList() {
    if (this.addListForm.valid) {
      const newTitle: string = this.addListForm.get('name')?.value;
      const id = generateRandomID();
      const newList: Document = {id: id, title: newTitle, items: []};
      this.documents.push(newList);
      this.documentsService.updateDocumentsList(this.documents).subscribe(response => {
        this.showAddListForm = false
        console.log('Zaktualizowano dane: ', response);
      });
    }
  }

  addMapDocument() {
    if (this.selectedMapFile) {
      this.documentsService.uploadMapDocument(this.selectedMapFile).subscribe(response => {
        console.log('File uploaded successfully!', response);
      });
      this.isMapAvailable = true
    }
  }

  addStatuteDocument() {
    if (this.selectedStatuteFile) {
      this.documentsService.uploadStatuteDocument(this.selectedStatuteFile).subscribe(response => {
        console.log('File uploaded successfully!', response);
      });
      this.isStatuteAvailable = true
    }
  }

  onItemAdded() {
    console.log(this.documents)
    this.documentsService.updateDocumentsList(this.documents).subscribe(response => {
      console.log('Zaktualizowano dane: ', response);
    });
  }


  title: any;
}

export function generateRandomID(): string {
  const length = 15;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  // Dodanie czasu do ID dla zwiększenia unikalności
  const timestamp = new Date().getTime().toString();
  result += timestamp;

  return result;
}


