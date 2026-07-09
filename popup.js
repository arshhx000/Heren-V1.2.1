document.addEventListener('DOMContentLoaded', function() {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  
  chrome.storage.local.get(['darkMode'], function(result) {
    if (result.darkMode) {
      document.body.classList.add('dark-mode');
      if (themeToggle) themeToggle.textContent = '☼';
    } else {
      if (themeToggle) themeToggle.textContent = '☾';
    }
  });
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      themeToggle.textContent = isDark ? '☼' : '☾';
      chrome.storage.local.set({ darkMode: isDark });
    });
  }
  
  // Export as JSON
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      chrome.storage.local.get(['copiedTexts', 'savedNotes'], function(result) {
        const dataStr = JSON.stringify(result, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `heren_export_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    });
  }

  const container = document.getElementById('copied-texts-container');
  
  // Get saved copied texts
  chrome.storage.local.get(['copiedTexts'], function(result) {
    let copiedTexts = result.copiedTexts;
    if (!Array.isArray(copiedTexts)) {
      copiedTexts = [];
    }
    
    if (copiedTexts.length === 0) {
      const p = document.createElement('p');
      p.className = 'no-texts';
      p.textContent = 'No copied texts found.';
      container.appendChild(p);
      return;
    }
    
    // Sort by newest first
    copiedTexts.sort((a, b) => b.timestamp - a.timestamp);
    
    // Display each copied text
    copiedTexts.forEach((item, index) => {
      const textElement = document.createElement('div');
      textElement.className = 'text-item';
      
      // Calculate time remaining
      const timeRemaining = Math.floor((item.expiryTime - new Date().getTime()) / (60 * 1000));
      
      const textHeader = document.createElement('div');
      textHeader.className = 'text-header';
      
      const websiteSpan = document.createElement('span');
      websiteSpan.className = 'website-name';
      websiteSpan.textContent = item.website || '';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.setAttribute('data-index', index);
      copyBtn.textContent = 'Copy';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.setAttribute('data-index', index);
      deleteBtn.innerHTML = '&times;';
      
      textHeader.appendChild(websiteSpan);
      textHeader.appendChild(copyBtn);
      textHeader.appendChild(deleteBtn);
      
      const textContentP = document.createElement('p');
      textContentP.className = 'text-content';
      
      const words = item.text.trim().split(/\s+/);
      const isLongText = words.length > 100;
      const truncatedText = isLongText ? words.slice(0, 100).join(' ') + '...' : item.text;
      
      textContentP.textContent = truncatedText;
      
      if (isLongText) {
        textContentP.setAttribute('data-full-text', item.text);
        textContentP.setAttribute('data-truncated', 'true');
        textContentP.classList.add('truncated');
        
        textContentP.addEventListener('click', function(e) {
          // If clicking highlighted text during search, ignore
          if (e.target.classList.contains('highlight')) return;
          
          const isTrunc = this.getAttribute('data-truncated') === 'true';
          if (isTrunc) {
            this.textContent = this.getAttribute('data-full-text');
            this.setAttribute('data-truncated', 'false');
            this.classList.remove('truncated');
            this.classList.add('expanded');
          } else {
            this.textContent = truncatedText;
            this.setAttribute('data-truncated', 'true');
            this.classList.remove('expanded');
            this.classList.add('truncated');
          }
        });
      }
      
      const expiryP = document.createElement('p');
      expiryP.className = 'expiry-time';
      expiryP.textContent = `Expires in: ${timeRemaining} minutes`;
      
      textElement.appendChild(textHeader);
      textElement.appendChild(textContentP);
      textElement.appendChild(expiryP);
      
      container.appendChild(textElement);
    });
    
    // Add event listeners for copy buttons
    document.querySelectorAll('.copy-btn').forEach(button => {
      button.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        const textToCopy = copiedTexts[index].text;
        navigator.clipboard.writeText(textToCopy);
        
        // Optional: Show feedback that text was copied
        this.textContent = 'Copied!';
        setTimeout(() => {
          this.textContent = 'Copy';
        }, 1500);
      });
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
      button.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        copiedTexts.splice(index, 1);
        
        chrome.storage.local.set({ copiedTexts: copiedTexts }, function() {
          // Refresh the popup to show updated list
          location.reload();
        });
      });
    });
  });

  // Keep button and modal elements
  const keepButton = document.getElementById('keep-button');
  const keepModal = document.getElementById('keep-modal');
  const closeModal = document.querySelector('.close-modal');
  const saveNoteBtn = document.getElementById('save-note');
  const noteContent = document.getElementById('note-content');
  
  // Open modal when Keep button is clicked
  if (keepButton) {
    keepButton.addEventListener('click', function() {
      if (keepModal) keepModal.style.display = 'block';
    });
  }
  
  // Close modal when X is clicked
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      if (keepModal) keepModal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside of it
  window.addEventListener('click', function(event) {
    if (keepModal && event.target == keepModal) {
      keepModal.style.display = 'none';
    }
  });
  
  // Save note when Save button is clicked
  if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', function() {
      const note = noteContent.value.trim();
      if (note) {
        // Save the note
        chrome.storage.local.get(['savedNotes'], function(result) {
          const savedNotes = result.savedNotes || [];
          savedNotes.push({
            content: note,
            timestamp: new Date().getTime()
          });
          
          chrome.storage.local.set({ savedNotes: savedNotes }, function() {
            // Close the modal and clear the textarea
            if (keepModal) keepModal.style.display = 'none';
            if (noteContent) noteContent.value = '';
            
            // Display the saved notes
            displaySavedNotes();
          });
        });
      }
    });
  }
  
  // Function to display saved notes
  function displaySavedNotes() {
    chrome.storage.local.get(['savedNotes'], function(result) {
      const savedNotes = result.savedNotes || [];
      
      // Check if notes section exists, if not create it
      let notesSection = document.querySelector('.notes-section');
      if (!notesSection) {
        notesSection = document.createElement('div');
        notesSection.className = 'notes-section';
        
        const notesHeader = document.createElement('div');
        notesHeader.className = 'notes-header';
        
        const h3 = document.createElement('h3');
        h3.textContent = 'Saved Notes';
        notesHeader.appendChild(h3);
        
        notesSection.appendChild(notesHeader);
        const container = document.querySelector('.container');
        if (container) container.appendChild(notesSection);
      }
      
      // Clear existing notes
      const existingNotes = notesSection.querySelectorAll('.note-item');
      existingNotes.forEach(note => note.remove());
      
      // Display saved notes in reverse chronological order
      savedNotes.sort((a, b) => b.timestamp - a.timestamp);
      
      savedNotes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        
        // Truncate text if longer than 100 characters
        const isLongNote = note.content.length > 100;
        const truncatedText = isLongNote ? note.content.substring(0, 100) + '...' : note.content;
        
        // Create content container
        const contentElement = document.createElement('div');
        contentElement.className = 'note-content';
        contentElement.textContent = truncatedText;
        
        // Store full content as data attribute
        if (isLongNote) {
          contentElement.setAttribute('data-full-text', note.content);
          contentElement.setAttribute('data-truncated', 'true');
          contentElement.classList.add('truncated');
        }
        
        // Add click event to expand/collapse
        if (isLongNote) {
          contentElement.addEventListener('click', function(e) {
            // Don't trigger if clicking delete button
            if (e.target.classList.contains('delete-btn')) return;
            
            const isTruncated = this.getAttribute('data-truncated') === 'true';
            if (isTruncated) {
              this.textContent = this.getAttribute('data-full-text');
              this.setAttribute('data-truncated', 'false');
              this.classList.remove('truncated');
              this.classList.add('expanded');
            } else {
              this.textContent = truncatedText;
              this.setAttribute('data-truncated', 'true');
              this.classList.remove('expanded');
              this.classList.add('truncated');
            }
          });
        }
        
        noteElement.appendChild(contentElement);
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.setAttribute('data-index', index);
        
        deleteBtn.addEventListener('click', function(e) {
          e.stopPropagation(); // Prevent triggering note click
          const noteIndex = this.getAttribute('data-index');
          savedNotes.splice(noteIndex, 1);
          
          chrome.storage.local.set({ savedNotes: savedNotes }, function() {
            displaySavedNotes();
          });
        });
        
        noteElement.appendChild(deleteBtn);
        notesSection.appendChild(noteElement);
      });
    });
  }
  
  // Display saved notes when popup opens
  displaySavedNotes();
  
  // Search elements
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  
  if (searchInput) {
    // Show/hide clear button based on search input
    searchInput.addEventListener('input', function() {
      if (clearSearchBtn) {
        if (this.value) {
          clearSearchBtn.style.display = 'block';
        } else {
          clearSearchBtn.style.display = 'none';
        }
      }
      performSearch(this.value);
    });
  }
  
  if (clearSearchBtn) {
    // Clear search when X button is clicked
    clearSearchBtn.addEventListener('click', function() {
      if (searchInput) searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      performSearch('');
    });
  }
  
  // Helper to highlight matches using DOM elements
  function highlightMatches(element, text, query) {
    element.innerHTML = ''; // safely clear the element
    if (!query) {
      element.textContent = text;
      return;
    }
    
    // Escape query for regex
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    const parts = text.split(regex);
    parts.forEach(part => {
      if (part.toLowerCase() === query.toLowerCase()) {
        const span = document.createElement('span');
        span.className = 'highlight';
        span.textContent = part;
        element.appendChild(span);
      } else if (part) {
        element.appendChild(document.createTextNode(part));
      }
    });
  }

  // Function to perform search
  function performSearch(query) {
    query = query.toLowerCase();
    
    // Search in copied texts
    const textItems = document.querySelectorAll('.text-item');
    textItems.forEach(item => {
      const textContent = item.querySelector('.text-content');
      const websiteName = item.querySelector('.website-name');
      
      if (!query) {
        // If search is cleared, restore original text and show all items
        if (textContent) {
          textContent.textContent = textContent.getAttribute('data-original') || textContent.textContent;
        }
        if (websiteName) {
          websiteName.textContent = websiteName.getAttribute('data-original') || websiteName.textContent;
        }
        item.style.display = 'block';
      } else {
        // Save original text if not already saved
        if (textContent && !textContent.hasAttribute('data-original')) {
          textContent.setAttribute('data-original', textContent.textContent);
        }
        if (websiteName && !websiteName.hasAttribute('data-original')) {
          websiteName.setAttribute('data-original', websiteName.textContent);
        }
        
        // Get text content
        const text = textContent ? textContent.getAttribute('data-original').toLowerCase() : '';
        const website = websiteName ? websiteName.getAttribute('data-original').toLowerCase() : '';
        
        // Check if query matches
        if (text.includes(query) || website.includes(query)) {
          // Highlight matches safely
          if (textContent) {
            highlightMatches(textContent, textContent.getAttribute('data-original'), query);
          }
          if (websiteName) {
            highlightMatches(websiteName, websiteName.getAttribute('data-original'), query);
          }
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      }
    });
    
    // Search in saved notes
    const noteItems = document.querySelectorAll('.note-item');
    noteItems.forEach(item => {
      const contentElement = item.querySelector('.note-content');
      if (!contentElement) return;
      
      if (!query) {
        // If search is cleared, restore truncated view
        const isLongNote = contentElement.hasAttribute('data-full-text');
        if (isLongNote) {
          const truncatedText = contentElement.getAttribute('data-full-text').substring(0, 100) + '...';
          contentElement.textContent = truncatedText;
          contentElement.setAttribute('data-truncated', 'true');
          contentElement.classList.add('truncated');
          contentElement.classList.remove('expanded');
        } else {
          if (contentElement.hasAttribute('data-original')) {
            contentElement.textContent = contentElement.getAttribute('data-original');
          }
        }
        item.style.display = 'block';
      } else {
        // For search, check against the full text
        const fullText = contentElement.hasAttribute('data-full-text') 
          ? contentElement.getAttribute('data-full-text') 
          : (contentElement.getAttribute('data-original') || contentElement.textContent);
          
        if (!contentElement.hasAttribute('data-full-text') && !contentElement.hasAttribute('data-original')) {
          contentElement.setAttribute('data-original', fullText);
        }
        
        // Check if query matches
        if (fullText.toLowerCase().includes(query)) {
          // Highlight matches safely
          highlightMatches(contentElement, fullText, query);
          contentElement.classList.remove('truncated');
          contentElement.classList.add('expanded');
          
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      }
    });
    
    // Show "No results found" message if needed
    const copiedTextsContainer = document.getElementById('copied-texts-container');
    const notesSection = document.querySelector('.notes-section');
    
    // Check if any copied texts are visible
    let hasVisibleCopiedTexts = false;
    textItems.forEach(item => {
      if (item.style.display !== 'none') {
        hasVisibleCopiedTexts = true;
      }
    });
    
    // Check if any notes are visible
    let hasVisibleNotes = false;
    noteItems.forEach(item => {
      if (item.style.display !== 'none') {
        hasVisibleNotes = true;
      }
    });
    
    // Show/hide "No results" message
    if (query && !hasVisibleCopiedTexts && copiedTextsContainer) {
      let noResults = copiedTextsContainer.querySelector('.no-results');
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.className = 'no-results';
        noResults.textContent = 'No matching copied texts found.';
        copiedTextsContainer.appendChild(noResults);
      }
    } else if (copiedTextsContainer) {
      const noResults = copiedTextsContainer.querySelector('.no-results');
      if (noResults) {
        noResults.remove();
      }
    }
    
    if (query && !hasVisibleNotes && notesSection) {
      let noResults = notesSection.querySelector('.no-results');
      if (!noResults) {
        noResults = document.createElement('p');
        noResults.className = 'no-results';
        noResults.textContent = 'No matching notes found.';
        notesSection.appendChild(noResults);
      }
    } else if (notesSection) {
      const noResults = notesSection.querySelector('.no-results');
      if (noResults) {
        noResults.remove();
      }
    }
  }
});
