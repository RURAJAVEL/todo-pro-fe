import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TodoCategory } from './todo-category';
import { TodoItem } from './todo-item/todo-item';
import { TodoService } from './todo.service';
import { CATEGORIES } from 'src/constant';
import { AccountService } from '../account/account.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {
  public todos$: TodoItem[];
  public todoCategories: string[];
  public selectedFilterType: string;
  public newTodo: TodoItem = new TodoItem(0, '', '', null, false);
  public filterValue: string;
  public openAddEditModal: Subject<TodoItem> = new Subject();
  public onAddEditComplete: Subject<void> = new Subject();
  public userValue = this.accountService.userValue;  

  public get todos(): Readonly<TodoItem[]> {
    return this._todoList;
  }

  private _todoList: TodoItem[] = [];
  private _filterBSDestroyed$: Subject<string> = new Subject();
  private _getTodoListDestroyed$: Subject<TodoItem[]> = new Subject();
  private _deleteTodoItemDestroyed$: Subject<any> = new Subject();
  private _addTodoItemDestroyed$: Subject<TodoItem> = new Subject();
  private _editTodoItemDestroyed$: Subject<TodoItem> = new Subject();

  constructor(
    private todoService: TodoService,
    private accountService: AccountService
  ) { }


  public ngOnInit(): void {
    this.getTodoList();
  }

  public ngOnDestroy(): void {
    this._filterBSDestroyed$.complete();
    this._getTodoListDestroyed$.complete();
    this._addTodoItemDestroyed$.complete();
    this._editTodoItemDestroyed$.complete();
    this._deleteTodoItemDestroyed$.complete();
  }

  public getTodoList(): void {
    this.todoService.getTodoList()
      .pipe(takeUntil(this._getTodoListDestroyed$))
      .subscribe(todos => {
        this._todoList = todos;
        this.todoCategories = [...CATEGORIES];
      });
  }

  public isCategorySelected(todoCategory: TodoCategory): boolean {
    return todoCategory && todoCategory === this.newTodo.category;
  }

  public openAddModal(): void {
    if(this.userValue){
      console.log("entered", this.newTodo)
      this.newTodo.label = "";
      this.newTodo.description = '';
      this.newTodo.category = null;
      this.openAddEditModal.next(this.newTodo);
    }
  }

  public deleteTodoItem(todoId: number): void {
    this.todoService
      .deleteTodoItem(todoId)
      .pipe(takeUntil(this._deleteTodoItemDestroyed$))
      .subscribe(() => {
        const index = this._todoList.findIndex(t => t.id === todoId);

        if (index !== -1) {
          this._todoList.splice(index, 1); 
        }
      });
  }

  public addTodoItem(todoItem: TodoItem): void {

    const todoNewId = Math.max(...this._todoList.map(o => o.id)) + 1; 
    todoItem.id = todoNewId;

    this.todoService.addTodoItem(todoItem)
      .pipe(takeUntil(this._addTodoItemDestroyed$))
      .subscribe(() => {
        this._todoList.push(new TodoItem(
          todoNewId,
          todoItem.label,
          todoItem.description,
          todoItem.category,
          todoItem.isCompleted,
          todoItem.completedOn));
      });
  }

  public editTodoItem(todoItem: TodoItem): void {
    this.todoService.editTodoItem(todoItem.id, todoItem)
      .pipe(takeUntil(this._editTodoItemDestroyed$))
      .subscribe(() => {
        const index = this._todoList.findIndex(t => t.id === todoItem.id);
        if (index!== -1) {
          this._todoList[index] = todoItem; // update the todo item
        }
      });
  }

}
