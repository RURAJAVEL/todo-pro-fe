import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { TodoCategory } from '../todo-category';
import { TodoItem } from './todo-item';
import { AccountService } from '../../../app/account/account.service';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss']
})
export class TodoItemComponent {
  @Input() todoItem: TodoItem;
  @Input() todoCategories: TodoItem;
  @Output() deleteTodoItem: EventEmitter<number> = new EventEmitter();
  @Output() editTodoItem: EventEmitter<TodoItem> = new EventEmitter();

  public editSelectedTodo: TodoItem;
  public openAddEditModal: Subject<TodoItem> = new Subject();
  public userValue = this.accountService.userValue;  

  constructor(
              private _modalService: NgbModal,
              private accountService: AccountService
            ) { }

  public isCategorySelected(todoCategory: TodoCategory): boolean {
    return todoCategory && todoCategory === this.editSelectedTodo.category;
  }

  public openDeleteTodoModal(content: any, todoId: number): void {
    if(this.userValue)
    this._modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        () => this.deleteTodoItem.next(todoId)
      );
  }

  public openCompleteTodoModal(content: any, todoItem: TodoItem): void {
    if(this.userValue)
    this._modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result
      .then(
        () => {
          let updatedTodoItem = JSON.parse(JSON.stringify(todoItem));
          updatedTodoItem.completedOn = new Date();
          updatedTodoItem.isCompleted = true;
          this.editTodoItem.next(updatedTodoItem);
        }
      );
  }

  public openResetCompleteTodoModal(content: any, todoItem: TodoItem): void {
    if(this.userValue)
    this._modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result
      .then(
        () => {
          let updatedTodoItem = JSON.parse(JSON.stringify(todoItem));
          updatedTodoItem.completedOn = null;
          updatedTodoItem.isCompleted = false;
          this.editTodoItem.next(updatedTodoItem);
        }
      );
  }

  public openEditTodoModal(todoItem: TodoItem): void {
    if(this.userValue){
      this.editSelectedTodo = JSON.parse(JSON.stringify(todoItem));
      this.openAddEditModal.next(todoItem);
    }
  }
}
