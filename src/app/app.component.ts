import { Component, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from './services/supabase.service';
import { NotificationService } from './notification/notification.service';
import { Subscription } from 'rxjs';

// Imports for Standalone Component
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationComponent } from './notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true, // Set component to standalone
  imports: [
    CommonModule,          // Needed for *ngIf, *ngFor, etc.
    FormsModule,           // Needed for [(ngModel)]
    NotificationComponent  // Import the standalone notification component
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'todo-app';
  todos: any[] = [];
  newTodoText = '';
  loading = false;
  private todoSubscription!: Subscription;

  constructor(
    private readonly supabase: SupabaseService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.getTodos();

    // Listen for real-time changes from the Supabase service
    this.todoSubscription = this.supabase.todoChanges.subscribe(async (change) => {
      console.log('Change received!', change);
      await this.getTodos(); // Refresh the list on any change
      this.notificationService.show('Todo list updated!');
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.todoSubscription) {
      this.todoSubscription.unsubscribe();
    }
  }

  async getTodos(): Promise<void> {
    this.loading = true;
    try {
      const todos = await this.supabase.getTodos();
      this.todos = todos || [];
    } catch (error: any) {
      this.notificationService.show(`Error: ${error.message}`);
    } finally {
      this.loading = false;
    }
  }

  async addTodo(): Promise<void> {
    if (this.newTodoText.trim().length === 0) {
      this.notificationService.show('Todo text cannot be empty.');
      return;
    }
    try {
      await this.supabase.addTodo(this.newTodoText.trim());
      this.newTodoText = ''; // Clear input field
      // The real-time subscription will handle updating the list
    } catch (error: any) {
      this.notificationService.show(`Error adding todo: ${error.message}`);
    }
  }

  async updateTodo(todo: any): Promise<void> {
    try {
      await this.supabase.updateTodo(todo.id, { is_completed: !todo.is_completed });
      // The real-time subscription will handle updating the list
    } catch (error: any) {
      this.notificationService.show(`Error updating todo: ${error.message}`);
    }
  }

  async deleteTodo(todo: any): Promise<void> {
    try {
      await this.supabase.deleteTodo(todo.id);
      // The real-time subscription will handle updating the list
    } catch (error: any) {
      this.notificationService.show(`Error deleting todo: ${error.message}`);
    }
  }
}
