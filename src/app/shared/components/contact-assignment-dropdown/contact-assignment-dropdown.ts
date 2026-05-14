import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../../core/interfaces/db-contact-interface';

/**
 * Contact assignment dropdown component for selecting and managing assigned contacts.
 * Provides search functionality, contact selection/deselection, and displays selected contacts with avatars.
 */
@Component({
  selector: 'app-contact-assignment-dropdown',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-assignment-dropdown.html',
  styleUrl: './contact-assignment-dropdown.scss',
  standalone: true,
})
export class ContactAssignmentDropdownComponent implements OnInit {
  @Input() contacts: Contact[] = [];
  @Input() selectedContactIds: string[] = [];
  @Output() selectedContactIdsChange = new EventEmitter<string[]>();

  showContactDropdown = false;
  filteredContacts: Contact[] = [];
  contactSearchTerm = 'Select contacts to assign';

  colorPalette = [
    '#FF7A00',
    '#9327FF',
    '#6E52FF',
    '#FC71FF',
    '#FFBB2B',
    '#1FD7C1',
    '#462F8A',
    '#FF4646',
    '#00BEE8',
    '#FF5EB3',
    '#FF745E',
    '#FFA35E',
    '#FFC701',
    '#0038FF',
    '#C3FF2B',
    '#FFE62B',
  ];

  /**
   * Lifecycle hook that runs on component initialization.
   * Initializes filtered contacts with all available contacts.
   */
  ngOnInit() {
    this.filteredContacts = [...this.contacts];
  }

  /**
   * Toggles the visibility of the contact dropdown.
   * Resets search term and filtered contacts when closing.
   */
  toggleContactDropdown() {
    this.showContactDropdown = !this.showContactDropdown;
    if (!this.showContactDropdown) {
      this.contactSearchTerm = 'Select contacts to assign';
      this.filteredContacts = [...this.contacts];
    }
  }

  /**
   * Handles contact input field focus event.
   * Clears placeholder text and opens dropdown.
   */
  onContactInputFocus() {
    if (this.contactSearchTerm === 'Select contacts to assign') {
      this.contactSearchTerm = '';
    }
    this.showContactDropdown = true;
  }

  /**
   * Handles contact input field blur event.
   * Restores placeholder text if input is empty.
   */
  onContactInputBlur() {
    setTimeout(() => {
      if (this.contactSearchTerm.trim() === '') {
        this.contactSearchTerm = 'Select contacts to assign';
      }
    }, 200);
  }

  /**
   * Filters contacts based on search term.
   * Searches by firstname, case-insensitive.
   */
  onContactSearch() {
    const searchTerm = this.contactSearchTerm.toLowerCase().trim();

    if (!searchTerm) {
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter((contact) =>
        contact.firstname.toLowerCase().includes(searchTerm)
      );
    }
  }

  /**
   * Toggles contact selection status.
   * Adds or removes contact from selected contacts list.
   *
   * @param contactId - The ID of the contact to toggle
   * @param event - Optional mouse event to stop propagation
   */
  toggleContact(contactId: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    const index = this.selectedContactIds.indexOf(contactId);
    const updatedIds = [...this.selectedContactIds];

    this.updateContactSelection(index, updatedIds, contactId);

    this.selectedContactIds = updatedIds;
    this.selectedContactIdsChange.emit(updatedIds);
  }

  /**
   * Updates the contact selection array based on index.
   *
   * @param index - Index of contact in selected array (-1 if not selected)
   * @param updatedIds - Array of selected contact IDs to update
   * @param contactId - ID of the contact to add or remove
   */
  private updateContactSelection(index: number, updatedIds: string[], contactId: string): void {
    if (index > -1) {
      updatedIds.splice(index, 1);
    } else {
      updatedIds.push(contactId);
    }
  }

  /**
   * Checks if a contact is currently selected.
   *
   * @param contactId - The ID of the contact to check
   * @returns True if contact is selected, false otherwise
   */
  isContactSelected(contactId: string): boolean {
    return this.selectedContactIds.includes(contactId);
  }

  /**
   * Gets the list of currently selected contacts.
   *
   * @returns Array of selected Contact objects
   */
  getSelectedContacts(): Contact[] {
    return this.contacts.filter((c) => this.selectedContactIds.includes(c.id!));
  }

  /**
   * Generates initials from a contact's firstname.
   * Returns first letter for single names, or first and last initial for multiple names.
   *
   * @param contact - The contact to generate initials for
   * @returns Uppercase initials (1-2 characters), or empty string if no firstname
   */
  getInitials(contact: Contact): string {
    if (!contact || !contact.firstname) return '';
    const nameParts = contact.firstname.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return this.getFirstAndLastInitial(nameParts);
  }

  /**
   * Extracts first and last initials from name parts.
   *
   * @param nameParts - Array of name parts
   * @returns Uppercase first and last initials
   */
  private getFirstAndLastInitial(nameParts: string[]): string {
    const firstInitial = nameParts[0].charAt(0);
    const lastInitial = nameParts[nameParts.length - 1].charAt(0);
    return (firstInitial + lastInitial).toUpperCase();
  }

  /**
   * Generates a consistent avatar color for a contact based on their ID.
   * Uses a hash function to map the ID to a color from the palette.
   *
   * @param contact - The contact to generate a color for
   * @returns Hex color code from the color palette
   */
  getAvatarColor(contact: Contact): string {
    let hash = 0;
    const idString = String(contact.id);
    for (let i = 0; i < idString.length; i++) {
      hash = idString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.colorPalette.length;
    return this.colorPalette[index];
  }

  /**
   * Closes the dropdown and resets search state.
   */
  closeDropdown() {
    this.showContactDropdown = false;
    this.contactSearchTerm = 'Select contacts to assign';
    this.filteredContacts = [...this.contacts];
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
}
