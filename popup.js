document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('copied-texts-container');
  
  // Get saved copied texts
  chrome.storage.local.get(['copiedTexts'], function(result) {
    const copiedTexts = result.copiedTexts || [];
    
    if (copiedTexts.length === 0) {
      container.innerHTML = '<p class="no-texts">No copied texts found.</p>';
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
      
      textElement.innerHTML = `
        <div class="text-header">
          <span class="website-name">${item.website || ''}</span>
          <button class="copy-btn" data-index="${index}">Copy</button>
          <button class="delete-btn" data-index="${index}">&times;</button>
        </div>
        <p class="text-content">${item.text}</p>
        <p class="expiry-time">Expires in: ${timeRemaining} minutes</p>
      `;
      
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
  keepButton.addEventListener('click', function() {
    keepModal.style.display = 'block';
  });
  
  // Close modal when X is clicked
  closeModal.addEventListener('click', function() {
    keepModal.style.display = 'none';
  });
  
  // Close modal when clicking outside of it
  window.addEventListener('click', function(event) {
    if (event.target == keepModal) {
      keepModal.style.display = 'none';
    }
  });
  
  // Save note when Save button is clicked
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
          keepModal.style.display = 'none';
          noteContent.value = '';
          
          // Display the saved notes
          displaySavedNotes();
        });
      });
    }
  });
  
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
        notesHeader.innerHTML = '<h3>Saved Notes</h3>';
        
        notesSection.appendChild(notesHeader);
        document.querySelector('.container').appendChild(notesSection);
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
  
  // Show/hide clear button based on search input
  searchInput.addEventListener('input', function() {
    if (this.value) {
      clearSearchBtn.style.display = 'block';
    } else {
      clearSearchBtn.style.display = 'none';
    }
    performSearch(this.value);
  });
  
  // Clear search when X button is clicked
  clearSearchBtn.addEventListener('click', function() {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    performSearch('');
  });
  
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
          textContent.innerHTML = textContent.getAttribute('data-original') || textContent.innerHTML;
        }
        if (websiteName) {
          websiteName.innerHTML = websiteName.getAttribute('data-original') || websiteName.innerHTML;
        }
        item.style.display = 'block';
      } else {
        // Save original text if not already saved
        if (textContent && !textContent.getAttribute('data-original')) {
          textContent.setAttribute('data-original', textContent.innerHTML);
        }
        if (websiteName && !websiteName.getAttribute('data-original')) {
          websiteName.setAttribute('data-original', websiteName.innerHTML);
        }
        
        // Get text content
        const text = textContent ? textContent.getAttribute('data-original').toLowerCase() : '';
        const website = websiteName ? websiteName.getAttribute('data-original').toLowerCase() : '';
        
        // Check if query matches
        if (text.includes(query) || website.includes(query)) {
          // Highlight matches
          if (textContent) {
            const highlightedText = highlightMatches(textContent.getAttribute('data-original'), query);
            textContent.innerHTML = highlightedText;
          }
          if (websiteName) {
            const highlightedWebsite = highlightMatches(websiteName.getAttribute('data-original'), query);
            websiteName.innerHTML = highlightedWebsite;
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
      
      if (!query) {
        // If search is cleared, restore truncated view
        if (contentElement) {
          const isLongNote = contentElement.hasAttribute('data-full-text');
          if (isLongNote) {
            const truncatedText = contentElement.getAttribute('data-full-text').substring(0, 100) + '...';
            contentElement.textContent = truncatedText;
            contentElement.setAttribute('data-truncated', 'true');
            contentElement.classList.add('truncated');
            contentElement.classList.remove('expanded');
          }
        }
        item.style.display = 'block';
      } else {
        // For search, we need to check against the full text
        const fullText = contentElement.hasAttribute('data-full-text') 
          ? contentElement.getAttribute('data-full-text') 
          : contentElement.textContent;
        
        // Check if query matches
        if (fullText.toLowerCase().includes(query.toLowerCase())) {
          // For search results, always show the full text with highlights
          const highlightedText = highlightMatches(fullText, query);
          contentElement.innerHTML = highlightedText;
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
  
  // Function to highlight matches in text
  function highlightMatches(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(query, 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
  }
});
