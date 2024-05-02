import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HandleError, HttpErrorHandler } from "../shared/http-error-handler.service";
import { TodoItem } from "./todo-item/todo-item";
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private handleError: HandleError; // for general error handling (can be improved)
  private todoBaseUrl = `${environment.apiUrl}/tasks`;  // URL to todo api   

  constructor(private http: HttpClient, httpErrorHandler: HttpErrorHandler) {
    this.handleError = httpErrorHandler.createHandleError('TodoService');
  }

  
  public getTodoList(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(this.todoBaseUrl)
      .pipe(
        map((todos: any) => {
          let todoList: TodoItem[] = todos.map(this._transform);
          return todoList;
        }),
        catchError(this.handleError('getTodoList', []))
      );
  }

  public addTodoItem(todoItem: TodoItem): Observable<TodoItem> {
    return this.http
      .post<TodoItem>(`${this.todoBaseUrl}`, {
        label: todoItem.label,
        description: todoItem.description,
        category: todoItem.category,
        done: this._getDonePropertyResult(todoItem)
      })
      .pipe(
        catchError(this.handleError('addTodoItem', [])),
        map(this._transform));
  }

  public editTodoItem(todoId: number, todoItem: TodoItem): Observable<TodoItem> {
    return this.http
      .patch<TodoItem>(`${this.todoBaseUrl}/${todoId}`, {
        label: todoItem.label,
        description: todoItem.description,
        category: todoItem.category,
        done: this._getDonePropertyResult(todoItem)
      })
      .pipe(
        catchError(this.handleError('editTodoItem', [])),
        map(this._transform));
  }

  public deleteTodoItem(todoId: number): any {
    return this.http
      .delete<TodoItem>(`${this.todoBaseUrl}/${todoId}`)
      .pipe(catchError(this.handleError('deleteTodoItem', [])));
  }

  private _transform(dbTodoItem: any): TodoItem {
    console.log('dbTodoItem', dbTodoItem);
    let item: any;
    if(Array.isArray(dbTodoItem)) {
      item = dbTodoItem[1][0];
    }
    else{
      item = dbTodoItem;
    }
    let isCompleted = !(/false/i).test(item.done); // filter out done: false and done:'dd-mm-yyyy' case
    let completedDate = isCompleted
      ? new Date(item.done.toString().split('-')[2], item.done.toString().split('-')[1] - 1, item.done.toString().split('-')[0]) // formatting with our specified version
      : null;

    return new TodoItem(
      item.id,
      item.label,
      item.description,
      item.category,
      isCompleted,
      completedDate
    )
  }

  private _getDonePropertyResult(todoItem: TodoItem): string | boolean {
    let done: string | boolean;
    if (todoItem.isCompleted) {
      done = formatDate(todoItem.completedOn, 'dd-MM-yyy', 'en-IN');
    } else {
      done = "false";
    }

    return done;
  }
}
