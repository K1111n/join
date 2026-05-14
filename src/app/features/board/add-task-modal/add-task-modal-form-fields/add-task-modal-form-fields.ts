import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../../core/interfaces/db-contact-interface';
import { ContactService } from '../../../../core/services/db-contact-service';
import { Subtask } from '../../../../core/interfaces/board-tasks-interface';
import { PrioritySelectorComponent } from '../../../../shared/components/priority-selector/priority-selector';
import { SubtaskManagerComponent } from '../../../../shared/components/subtask-manager/subtask-manager';
import { ContactAssignmentDropdownComponent } from '../../../../shared/components/contact-assignment-dropdown/contact-assignment-dropdown';

/**
 * Form fields component for add task modal.
 * Handles all input fields, validation, and data binding for task creation.
 */
@Component({
  selector: 'app-add-task-modal-form-fields',
  imports: [
    CommonModule,
    FormsModule,
    PrioritySelectorComponent,
    SubtaskManagerComponent,
    ContactAssignmentDropdownComponent,
  ],
  templateUrl: './add-task-modal-form-fields.html',
  styleUrl: './add-task-modal-form-fields.scss',
  standalone: true,
})
export class AddTaskModalFormFields implements OnInit {
  @Input() title = '';
  @Input() description = '';
  @Input() dueDate = '';
  @Input() priority: 'urgent' | 'medium' | 'low' = 'medium';
  @Input() category = '';
  @Input() selectedContactIds: string[] = [];
  @Input() subtasks: Subtask[] = [];

  @Output() titleChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  @Output() dueDateChange = new EventEmitter<string>();
  @Output() priorityChange = new EventEmitter<'urgent' | 'medium' | 'low'>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() selectedContactIdsChange = new EventEmitter<string[]>();
  @Output() subtasksChange = new EventEmitter<Subtask[]>();

  private contactService = inject(ContactService);

  hiddenDateValue = '';
  minDate = this.getTodayDateString();

  showCategoryDropdown = false;

  contacts: Contact[] = [];
  categories = ['Technical Task', 'User Story'];

  titleError = false;
  dueDateError = false;
  dueDateErrorMessage = 'This field is required';
  categoryError = false;

  @ViewChild('datePicker') datePicker!: ElementRef<HTMLInputElement>;

  /**
   * Lifecycle hook that runs on component initialization.
   * Loads all contacts from the database.
   */
  async ngOnInit() {
    await this.loadContacts();
  }

  /**
   * Loads all contacts from the database.
   */
  async loadContacts() {
    this.contacts = await this.contactService.getAllContacts();
  }

  /**
   * Toggles the visibility of the category dropdown.
   */
  toggleCategoryDropdown() {
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  /**
   * Selects a category and closes the dropdown.
   * Clears category error and emits the selection.
   *
   * @param category - The selected category
   */
  selectCategory(category: string) {
    this.category = category;
    this.categoryError = false;
    this.categoryChange.emit(this.category);
    this.showCategoryDropdown = false;
  }

  /**
   * Formats date input as DD/MM/YYYY while typing.
   * Automatically adds slashes at appropriate positions.
   *
   * @param event - The input event
   */
  formatDateInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length >= 5) {
      value = value.substring(0, 5) + '/' + value.substring(5, 9);
    }

    this.dueDate = value;
    this.dueDateChange.emit(this.dueDate);
  }

  /**
   * Opens the native date picker dialog.
   */
  openDatePicker() {
    this.datePicker.nativeElement.showPicker();
  }

  /**
   * Handles date selection from the native date picker.
   * Converts YYYY-MM-DD to DD/MM/YYYY format.
   *
   * @param event - The change event from the date picker
   */
  onDatePickerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value;

    if (dateValue) {
      const [year, month, day] = dateValue.split('-');
      this.dueDate = `${day}/${month}/${year}`;
      this.dueDateChange.emit(this.dueDate);
    }
  }

  /**
   * Gets today's date as a string in YYYY-MM-DD format.
   *
   * @returns Today's date string
   */
  getTodayDateString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Changes arrow image on hover based on dropdown state.
   *
   * @param imgElement - The arrow image element
   * @param isDropdownOpen - Current dropdown open state
   */
  onArrowHover(imgElement: HTMLImageElement, isDropdownOpen: boolean) {
    if (isDropdownOpen) {
      imgElement.src = 'assets/icons/arrow-up-variant2.png';
    } else {
      imgElement.src = 'assets/icons/arrow-down-variant2.png';
    }
  }

  /**
   * Restores arrow image when hover ends based on dropdown state.
   *
   * @param imgElement - The arrow image element
   * @param isDropdownOpen - Current dropdown open state
   */
  onArrowLeave(imgElement: HTMLImageElement, isDropdownOpen: boolean) {
    if (isDropdownOpen) {
      imgElement.src = 'assets/board/arrow-drop-up-transparent.png';
    } else {
      imgElement.src = 'assets/board/arrow-drop-down-transparent.png';
    }
  }

  /**
   * Handles title input changes.
   * Clears title error and emits the new value.
   */
  onTitleInput() {
    this.titleError = false;
    this.titleChange.emit(this.title);
  }

  /**
   * Handles description changes and emits the new value.
   */
  onDescriptionChange() {
    this.descriptionChange.emit(this.description);
  }

  /**
   * Handles date changes and clears date error.
   */
  onDateChange() {
    this.dueDateError = false;
  }

  /**
   * Handles changes to selected contact IDs and emits the new value.
   *
   * @param contactIds - The updated array of selected contact IDs
   */
  onSelectedContactIdsChange(contactIds: string[]) {
    this.selectedContactIds = contactIds;
    this.selectedContactIdsChange.emit(contactIds);
  }

  /**
   * Handles changes to subtasks and emits the new value.
   *
   * @param subtasks - The updated array of subtasks
   */
  onSubtasksChange(subtasks: Subtask[]) {
    this.subtasks = subtasks;
    this.subtasksChange.emit(subtasks);
  }

  /**
   * Closes all open dropdowns.
   */
  closeDropdowns() {
    this.showCategoryDropdown = false;
  }
}
