<<<<<<< HEAD
// static/js/main.js - Updated for larger chatbot

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    
    // DOM Elements
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const categoryButtons = document.getElementById('categoryButtons');
    const podcastGrid = document.getElementById('podcastGrid');
    const categoryCheckboxes = document.getElementById('categoryCheckboxes');
    const popularitySlider = document.getElementById('popularitySlider');
    const popularityValue = document.getElementById('popularityValue');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    // Log if any elements are missing
    if (!chatMessages) console.error("Element #chatMessages not found");
    if (!userInput) console.error("Element #userInput not found");
    if (!sendButton) console.error("Element #sendButton not found");
    
    // Templates
    const podcastCardTemplate = document.getElementById('podcast-card-template');
    if (!podcastCardTemplate) console.error("Podcast card template not found");

    // State
    let allPodcasts = [];
    let allCategories = [];
    let selectedCategory = '';

    // Initialize
    console.log("Initializing app...");
    fetchCategories();
    fetchPodcasts();

    // Event listeners
    if (userInput) {
        userInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                console.log("Enter pressed in input");
                sendMessage();
            }
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', function() {
            console.log("Send button clicked");
            sendMessage();
        });
    }

    if (popularitySlider) {
        popularitySlider.addEventListener('input', function() {
            popularityValue.textContent = this.value;
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', performAdvancedSearch);
    }

    // Fetch all podcasts
    function fetchPodcasts() {
        console.log("Fetching podcasts...");
        fetch('/api/podcasts')
            .then(response => {
                console.log("Podcast response status:", response.status);
                return response.json();
            })
            .then(data => {
                console.log(`Received ${data.length} podcasts`);
                allPodcasts = data;
                displayFeaturedPodcasts();
            })
            .catch(error => console.error('Error fetching podcasts:', error));
    }

    // Fetch all categories
    function fetchCategories() {
        console.log("Fetching categories...");
        fetch('/api/categories')
            .then(response => {
                console.log("Categories response status:", response.status);
                return response.json();
            })
            .then(data => {
                console.log(`Received ${data.length} categories`);
                allCategories = data;
                populateCategoryCheckboxes();
                setupCategoryFilters();
            })
            .catch(error => console.error('Error fetching categories:', error));
    }

    // Display featured (popular) podcasts
    function displayFeaturedPodcasts() {
        console.log("Displaying featured podcasts");
        if (!podcastGrid) {
            console.error("podcastGrid element not found");
            return;
        }
        
        // Clear loading spinner
        podcastGrid.innerHTML = '';
        
        if (allPodcasts.length === 0) {
            console.log("No podcasts available to display");
            return;
        }
        
        // Sort by popularity and get top 6
        const featured = [...allPodcasts]
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 6);
            
        console.log(`Displaying ${featured.length} featured podcasts`);
            
        // Add to grid
        featured.forEach(podcast => {
            podcastGrid.appendChild(createPodcastCard(podcast));
        });
    }

    let podcastDetailsModal;
    
    // Create and append the podcast details modal to the body
    function createPodcastDetailsModal() {
        // Create the modal container if it doesn't exist yet
        if (!podcastDetailsModal) {
            podcastDetailsModal = document.createElement('div');
            podcastDetailsModal.id = 'podcastDetailsModal';
            podcastDetailsModal.className = 'podcast-details-modal';
            
            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.className = 'podcast-details-content';
            
            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-modal';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', closePodcastDetailsModal);
            
            // Podcast details will be inserted here
            const detailsContainer = document.createElement('div');
            detailsContainer.id = 'podcastDetailsContainer';
            detailsContainer.className = 'podcast-details-container';
            
            // Assemble modal
            modalContent.appendChild(closeBtn);
            modalContent.appendChild(detailsContainer);
            podcastDetailsModal.appendChild(modalContent);
            
            // Add click event to close modal when clicking outside content
            podcastDetailsModal.addEventListener('click', function(event) {
                if (event.target === podcastDetailsModal) {
                    closePodcastDetailsModal();
                }
            });
            
            // Add key event to close modal with Escape key
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && podcastDetailsModal.classList.contains('show')) {
                    closePodcastDetailsModal();
                }
            });
            
            // Add to document
            document.body.appendChild(podcastDetailsModal);
        }
    }
    
    // Show podcast details in modal
    function showPodcastDetails(podcast) {
        console.log("Showing details for podcast:", podcast.title);
        
        // Ensure modal exists
        createPodcastDetailsModal();
        
        const detailsContainer = document.getElementById('podcastDetailsContainer');
        
        // Clear previous content
        detailsContainer.innerHTML = '';
        
        // Create detailed view of podcast
        const detailsContent = document.createElement('div');
        detailsContent.className = 'podcast-full-details';
        
        // Header with image and basic info
        const header = document.createElement('div');
        header.className = 'podcast-details-header';
        
        // Image
        const imageContainer = document.createElement('div');
        imageContainer.className = 'podcast-details-image';
        const image = document.createElement('img');
        image.src = podcast.image_url || '/static/images/podcasts/generic1.jpg';
        image.alt = podcast.title;
        imageContainer.appendChild(image);
        
        // Info section
        const infoContainer = document.createElement('div');
        infoContainer.className = 'podcast-details-info';
        
        // Title
        const title = document.createElement('h2');
        title.textContent = podcast.title;
        title.className = 'podcast-details-title';
        
        // Host
        const host = document.createElement('p');
        host.className = 'podcast-details-host';
        host.innerHTML = `<strong>Hosted by:</strong> ${podcast.host}`;
        
        // Rating display
        const ratingDisplay = document.createElement('div');
        ratingDisplay.className = 'podcast-details-rating';
        
        // Rating value
        const ratingValue = document.createElement('span');
        ratingValue.textContent = podcast.popularity.toFixed(1);
        ratingValue.className = 'rating-value';
        
        // Stars
        const stars = document.createElement('div');
        stars.className = 'rating-stars';
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('i');
            if (i < Math.floor(podcast.popularity / 2)) {
                star.className = 'fas fa-star';
            } else if (i === Math.floor(podcast.popularity / 2) && podcast.popularity % 2 >= 1) {
                star.className = 'fas fa-star-half-alt';
            } else {
                star.className = 'far fa-star';
            }
            stars.appendChild(star);
        }
        
        ratingDisplay.appendChild(ratingValue);
        ratingDisplay.appendChild(stars);
        
        // Average episode length
        const duration = document.createElement('p');
        duration.className = 'podcast-details-duration';
        duration.innerHTML = `<i class="fas fa-clock"></i> <strong>Average episode:</strong> ${formatDuration(podcast.avg_episode_length)}`;
        
        // Categories
        const categories = document.createElement('div');
        categories.className = 'podcast-details-categories';
        categories.innerHTML = '<strong>Categories:</strong> ';
        
        const categoryList = document.createElement('div');
        categoryList.className = 'categories-list';
        
        podcast.categories.forEach(category => {
            const categoryTag = document.createElement('span');
            categoryTag.className = 'podcast-category';
            categoryTag.textContent = category;
            categoryList.appendChild(categoryTag);
        });
        
        categories.appendChild(categoryList);
        
        // Listen button
        const listenBtn = document.createElement('a');
        listenBtn.href = podcast.spotify_url || '#';
        listenBtn.className = 'listen-button details-listen-button';
        listenBtn.target = '_blank';
        listenBtn.innerHTML = '<i class="fab fa-spotify"></i> Listen on Spotify';
        
        // Assemble info container
        infoContainer.appendChild(title);
        infoContainer.appendChild(host);
        infoContainer.appendChild(ratingDisplay);
        infoContainer.appendChild(duration);
        infoContainer.appendChild(categories);
        infoContainer.appendChild(listenBtn);
        
        // Assemble header
        header.appendChild(imageContainer);
        header.appendChild(infoContainer);
        
        // Description section
        const descriptionSection = document.createElement('div');
        descriptionSection.className = 'podcast-details-description';
        
        const descriptionTitle = document.createElement('h3');
        descriptionTitle.textContent = 'About This Podcast';
        
        const description = document.createElement('p');
        description.textContent = podcast.description;
        
        descriptionSection.appendChild(descriptionTitle);
        descriptionSection.appendChild(description);
        
        // Episodes section (placeholder - would normally fetch real episodes)
        const episodesSection = document.createElement('div');
        episodesSection.className = 'podcast-details-episodes';
        
        const episodesTitle = document.createElement('h3');
        episodesTitle.textContent = 'Recent Episodes';
        
        const episodesList = document.createElement('ul');
        episodesList.className = 'episodes-list';
        
        // Sample episodes (in a real app, these would be fetched from an API)
        const sampleEpisodes = [
            { title: `${podcast.title} - Latest Episode`, duration: Math.floor(Math.random() * 20) + podcast.avg_episode_length },
            { title: `${podcast.title} - Fan Favorite`, duration: Math.floor(Math.random() * 20) + podcast.avg_episode_length - 5 },
            { title: `${podcast.title} - Special Guest`, duration: Math.floor(Math.random() * 20) + podcast.avg_episode_length + 10 }
        ];
        
        sampleEpisodes.forEach(episode => {
            const episodeItem = document.createElement('li');
            episodeItem.className = 'episode-item';
            
            const episodeTitle = document.createElement('h4');
            episodeTitle.textContent = episode.title;
            
            const episodeDuration = document.createElement('span');
            episodeDuration.className = 'episode-duration';
            episodeDuration.innerHTML = `<i class="fas fa-clock"></i> ${formatDuration(episode.duration)}`;
            
            const playButton = document.createElement('button');
            playButton.className = 'episode-play-button';
            playButton.innerHTML = '<i class="fas fa-play"></i> Play';
            
            episodeItem.appendChild(episodeTitle);
            episodeItem.appendChild(episodeDuration);
            episodeItem.appendChild(playButton);
            
            episodesList.appendChild(episodeItem);
        });
        
        episodesSection.appendChild(episodesTitle);
        episodesSection.appendChild(episodesList);
        
        // Assemble all sections
        detailsContent.appendChild(header);
        detailsContent.appendChild(descriptionSection);
        detailsContent.appendChild(episodesSection);
        
        // Add to container
        detailsContainer.appendChild(detailsContent);
        
        // Show modal with animation
        podcastDetailsModal.classList.add('show');
    }
    
    // Close podcast details modal
    function closePodcastDetailsModal() {
        if (podcastDetailsModal) {
            podcastDetailsModal.classList.remove('show');
        }
    }

    // Setup category filter buttons
    function setupCategoryFilters() {
        if (!categoryButtons) {
            console.error("categoryButtons element not found");
            return;
        }
        
        console.log("Setting up category filters");
        
        // Clear existing buttons
        categoryButtons.innerHTML = '';
        
        // Add "All" button
        const allButton = document.createElement('button');
        allButton.classList.add('category-button', 'active');
        allButton.textContent = 'All';
        allButton.addEventListener('click', () => {
            // Update active button
            document.querySelectorAll('.category-button').forEach(btn => 
                btn.classList.remove('active')
            );
            allButton.classList.add('active');
            
            // Reset selection and display featured
            selectedCategory = '';
            displayFeaturedPodcasts();
        });
        categoryButtons.appendChild(allButton);
        
        // Add category buttons
        allCategories.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('category-button');
            button.textContent = category;
            button.dataset.category = category;
            
            button.addEventListener('click', () => {
                // Update active button
                document.querySelectorAll('.category-button').forEach(btn => 
                    btn.classList.remove('active')
                );
                button.classList.add('active');
                
                // Update selection and display filtered podcasts
                selectedCategory = category;
                displayPodcastsByCategory(category);
            });
            
            categoryButtons.appendChild(button);
        });
    }

    // Populate category checkboxes for advanced search
    function populateCategoryCheckboxes() {
        if (!categoryCheckboxes) {
            console.log("categoryCheckboxes element not found, skipping");
            return;
        }
        
        console.log("Populating category checkboxes");
        
        // Clear existing checkboxes
        categoryCheckboxes.innerHTML = '';
        
        // Add checkboxes for each category
        allCategories.forEach(category => {
            const label = document.createElement('label');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = category;
            checkbox.name = 'categories';
            
            const span = document.createElement('span');
            span.textContent = category;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            
            categoryCheckboxes.appendChild(label);
        });
    }

    // Send user message to chatbot
// Simplified functions without animations

// Send user message to chatbot
function sendMessage() {
    console.log("sendMessage function called");
  
    if (!userInput) {
      console.error("userInput element is null");
      return;
    }
  
    const message = userInput.value.trim();
    console.log("User message:", message);
  
    if (!message) {
      console.log("Message is empty, not sending");
      return;
    }
  
    // Add user message to chat
    addMessageToChat(message, 'user');
  
    // Clear input
    userInput.value = '';
  
    // Show simple loading message instead of typing animation
    showLoadingMessage();
  
    console.log("Sending message to backend...");
    
    // Send to backend
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message })
    })
    .then(response => {
      console.log("Response received, status:", response.status);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
        console.log("Response data:", data);
        
        // Remove loading message
        removeLoadingMessage();
      
        // Add delay before showing the response (500ms = 0.5 seconds)
        setTimeout(() => {
          // Add bot response without animation
          addMessageToChat(data.message, 'bot');
      
          // If recommendations were provided, display them
          if (data.recommendations && data.recommendations.length > 0) {
            console.log(`Displaying ${data.recommendations.length} recommendations`);
            displayRecommendations(data.recommendations);
          }
          
          // Simple instant scroll to bottom
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 800); // Adjust this number to control the delay in milliseconds
      })
    .catch(error => {
      console.error('Error in fetch:', error);
      removeLoadingMessage();
      addMessageToChat("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }
  
  // Simplified add message function
  function addMessageToChat(message, sender) {
    console.log(`Adding ${sender} message to chat`);
  
    if (!chatMessages) {
      console.error("chatMessages element not found");
      return;
    }
  
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender + '-message');
  
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
  
    const icon = document.createElement('i');
    if (sender === 'bot') {
      icon.classList.add('fas', 'fa-robot');
    } else {
      icon.classList.add('fas', 'fa-user');
    }
  
    avatar.appendChild(icon);
  
    const content = document.createElement('div');
    content.classList.add('message-content');
    
    // Ensure message content has proper width constraints
    content.style.width = '100%';
    content.style.maxWidth = '95%';
    content.style.wordWrap = 'break-word';
    content.style.overflowWrap = 'break-word';
  
    // Standard display without animations
    if (message.includes('\n')) {
      const paragraphs = message.split('\n').filter(para => para.trim() !== '');
      paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        p.style.width = '100%';
        p.style.wordWrap = 'break-word';
        p.style.overflowWrap = 'break-word';
        p.textContent = paragraph;
        content.appendChild(p);
      });
    } else {
      const p = document.createElement('p');
      p.style.width = '100%';
      p.style.wordWrap = 'break-word';
      p.style.overflowWrap = 'break-word';
      p.textContent = message;
      content.appendChild(p);
    }
  
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
  
    chatMessages.appendChild(messageDiv);
  
    // Simple instant scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Simple loading message instead of typing animation
  function showLoadingMessage() {
    console.log("Showing loading message");
  
    if (!chatMessages) {
      console.error("chatMessages element not found");
      return;
    }
  
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot-message', 'loading-message');
    loadingDiv.id = 'loading-message';
  
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
  
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-robot');
  
    avatar.appendChild(icon);
  
    const content = document.createElement('div');
    content.classList.add('message-content');
  
    const text = document.createElement('p');
    text.textContent = "Loading response...";
    content.appendChild(text);
  
    loadingDiv.appendChild(avatar);
    loadingDiv.appendChild(content);
  
    chatMessages.appendChild(loadingDiv);
    
    // Simple instant scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Remove loading message
  function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }
  
  // Display recommendations without animations
  function displayRecommendations(recommendations) {
    console.log("Displaying podcast recommendations in chat");
    
    // Create container for recommendations
    const recDiv = document.createElement('div');
    recDiv.classList.add('podcast-recommendations');
  
    // Add heading
    const heading = document.createElement('h3');
    heading.textContent = 'Recommended Podcasts';
    heading.style.marginBottom = '15px';
    recDiv.appendChild(heading);
  
    // Create a grid for podcasts
    const grid = document.createElement('div');
    grid.classList.add('chatbot-podcast-grid');
  
    // Add podcasts to grid
    recommendations.forEach(podcast => {
      // Create a more compact card for the chat
      const card = createCompactPodcastCard(podcast);
      grid.appendChild(card);
    });
  
    recDiv.appendChild(grid);
  
    // Add to chat as a bot message
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot-message');
  
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
  
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-robot');
  
    avatar.appendChild(icon);
  
    const content = document.createElement('div');
    content.classList.add('message-content');
    content.style.maxWidth = '95%'; // Allow recommendations to use more space
  
    content.appendChild(recDiv);
  
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
  
    chatMessages.appendChild(messageDiv);
  
    // Simple instant scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

    // Show typing indicator
    function showTypingIndicator() {
        console.log("Showing typing indicator");
        
        if (!chatMessages) {
            console.error("chatMessages element not found");
            return;
        }
        
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
        
        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar');
        
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-robot');
        
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.classList.add('message-content');
        
        const dots = document.createElement('p');
        dots.innerHTML = '<span>●</span><span>●</span><span>●</span>';
        dots.classList.add('typing-dots');
        
        content.appendChild(dots);
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        
        chatMessages.appendChild(typingDiv);
        
        // Scroll to bottom of chat with a smooth animation
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        console.log("Removing typing indicator");
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        } else {
            console.log("No typing indicator found to remove");
        }
    }
    
    // Display podcasts by category
    function displayPodcastsByCategory(category) {
        console.log(`Displaying podcasts for category: ${category}`);
        // Show loading spinner
        podcastGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
        
        // Filter podcasts by category
        const filteredPodcasts = allPodcasts.filter(podcast => 
            podcast.categories.includes(category)
        );
        
        console.log(`Found ${filteredPodcasts.length} podcasts in category ${category}`);
        
        // Clear and display results
        setTimeout(() => {
            podcastGrid.innerHTML = '';
            
            if (filteredPodcasts.length === 0) {
                console.log("No podcasts found in this category");
                podcastGrid.innerHTML = '<p class="no-results">No podcasts found in this category.</p>';
                return;
            }
            
            filteredPodcasts.forEach(podcast => {
                podcastGrid.appendChild(createPodcastCard(podcast));
            });
        }, 500); // Simulated loading delay
    }

    // Display podcast recommendations in chat - Enhanced for larger chat window
    function displayRecommendations(recommendations) {
        console.log("Displaying podcast recommendations in chat");
        // Create container for recommendations
        const recDiv = document.createElement('div');
        recDiv.classList.add('podcast-recommendations');
        
        // Add heading
        const heading = document.createElement('h3');
        heading.textContent = 'Recommended Podcasts';
        heading.style.marginBottom = '15px';
        recDiv.appendChild(heading);
        
        // Create a grid for podcasts - use chatbot-podcast-grid for chat recommendations
        const grid = document.createElement('div');
        grid.classList.add('chatbot-podcast-grid');
        
        // Add podcasts to grid - show up to 3 per row in the larger chat window
        recommendations.forEach(podcast => {
            // Create a more compact card for the chat
            const card = createCompactPodcastCard(podcast);
            grid.appendChild(card);
        });
        
        recDiv.appendChild(grid);
        
        // Add to chat as a bot message
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        
        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar');
        
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-robot');
        
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.classList.add('message-content');
        content.style.maxWidth = '95%'; // Allow recommendations to use more space
        
        content.appendChild(recDiv);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom of chat with smooth animation
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Create compact podcast card specifically for chat recommendations
    function createCompactPodcastCard(podcast) {
        const card = document.createElement('div');
        card.classList.add('chatbot-podcast-card');
        
        // Make entire card clickable
        card.addEventListener('click', function() {
            showPodcastDetails(podcast);
        });
        card.style.cursor = 'pointer';
        
        // Image
        const imageDiv = document.createElement('div');
        imageDiv.classList.add('chatbot-podcast-image');
        const img = document.createElement('img');
        img.src = podcast.image_url || '/static/images/podcasts/generic1.jpg';
        img.alt = podcast.title;
        imageDiv.appendChild(img);
        
        // Info
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('chatbot-podcast-info');
        
        // Title
        const title = document.createElement('h4');
        title.textContent = podcast.title;
        
        // Host
        const host = document.createElement('div');
        host.classList.add('chatbot-podcast-host');
        host.textContent = `Hosted by ${podcast.host}`;
        
        // Rating
        const rating = document.createElement('div');
        rating.classList.add('chatbot-podcast-rating');
        const ratingValue = document.createElement('span');
        ratingValue.textContent = podcast.popularity.toFixed(1);
        const stars = document.createElement('div');
        stars.classList.add('rating-stars');
        
        // Create stars
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('i');
            if (i < Math.floor(podcast.popularity / 2)) {
                star.className = 'fas fa-star';
            } else if (i === Math.floor(podcast.popularity / 2) && podcast.popularity % 2 >= 1) {
                star.className = 'fas fa-star-half-alt';
            } else {
                star.className = 'far fa-star';
            }
            stars.appendChild(star);
        }
        rating.appendChild(ratingValue);
        rating.appendChild(stars);
        
        // Categories
        const categories = document.createElement('div');
        categories.classList.add('chatbot-podcast-categories');
        podcast.categories.forEach(category => {
            const categorySpan = document.createElement('span');
            categorySpan.classList.add('chatbot-podcast-category');
            categorySpan.textContent = category;
            categories.appendChild(categorySpan);
        });
        
        // Duration
        const duration = document.createElement('div');
        duration.classList.add('chatbot-podcast-duration');
        const clockIcon = document.createElement('i');
        clockIcon.classList.add('fas', 'fa-clock');
        const durationText = document.createElement('span');
        durationText.textContent = formatDuration(podcast.avg_episode_length);
        duration.appendChild(clockIcon);
        duration.appendChild(durationText);
        
        // Description
        const description = document.createElement('p');
        description.classList.add('chatbot-podcast-description');
        description.textContent = podcast.description;
        
        // Listen button - Modified to stop propagation
        const listenBtn = document.createElement('a');
        listenBtn.href = podcast.spotify_url || '#';
        listenBtn.classList.add('chatbot-listen-button');
        listenBtn.target = '_blank';
        listenBtn.addEventListener('click', function(event) {
            // Prevent triggering the card click when clicking the listen button
            event.stopPropagation();
        });
        
        const spotifyIcon = document.createElement('i');
        spotifyIcon.classList.add('fab', 'fa-spotify');
        listenBtn.appendChild(spotifyIcon);
        listenBtn.appendChild(document.createTextNode('Listen on Spotify'));
        
        // Append all elements
        infoDiv.appendChild(title);
        infoDiv.appendChild(host);
        infoDiv.appendChild(rating);
        infoDiv.appendChild(categories);
        infoDiv.appendChild(duration);
        infoDiv.appendChild(description);
        infoDiv.appendChild(listenBtn);
        
        card.appendChild(imageDiv);
        card.appendChild(infoDiv);
        
        return card;
    }
    
    // Also modify the main podcast cards to show details
    function createPodcastCard(podcast, compact = false) {
        // Check if template exists
        if (!podcastCardTemplate) {
            console.error("Podcast card template not found");
            return document.createElement('div');
        }
        
        console.log(`Creating card for podcast: ${podcast.title}`);
        
        // Clone template
        const card = document.importNode(podcastCardTemplate.content, true).querySelector('.podcast-card');
        
        // Add click event to show details
        card.addEventListener('click', function(event) {
            // Prevent default if it's a link or button
            if (event.target.tagName !== 'A' && event.target.tagName !== 'BUTTON') {
                showPodcastDetails(podcast);
            }
        });
        card.style.cursor = 'pointer';
        
        // Fill in data
        card.querySelector('.podcast-image img').src = podcast.image_url || '/static/images/podcasts/generic1.jpg';
        card.querySelector('.podcast-image img').alt = podcast.title;
        card.querySelector('.podcast-title').textContent = podcast.title;
        card.querySelector('.podcast-host').textContent = `Hosted by ${podcast.host}`;
        
        // Rating
        const ratingValue = card.querySelector('.rating-value');
        ratingValue.textContent = podcast.popularity.toFixed(1);
        
        const ratingStars = card.querySelector('.rating-stars');
        ratingStars.innerHTML = '';
        
        // Create rating stars (full, half or empty)
        const fullStars = Math.floor(podcast.popularity / 2);
        const hasHalfStar = (podcast.popularity / 2) % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('i');
            if (i < fullStars) {
                star.className = 'fas fa-star';
            } else if (i === fullStars && hasHalfStar) {
                star.className = 'fas fa-star-half-alt';
            } else {
                star.className = 'far fa-star';
            }
            ratingStars.appendChild(star);
        }
        
        // Categories
        const categoriesContainer = card.querySelector('.podcast-categories');
        categoriesContainer.innerHTML = '';
        
        podcast.categories.forEach(category => {
            const span = document.createElement('span');
            span.className = 'podcast-category';
            span.textContent = category;
            categoriesContainer.appendChild(span);
        });
        
        // Duration
        const avgDuration = podcast.avg_episode_length || podcast.avg_duration || 0;
        card.querySelector('.podcast-duration span').textContent = formatDuration(avgDuration);
        
        // Description
        card.querySelector('.podcast-description').textContent = podcast.description;
        
        // Listen button - prevent propagation
        const listenButton = card.querySelector('.listen-button');
        listenButton.href = podcast.spotify_url || '#';
        listenButton.addEventListener('click', function(event) {
            event.stopPropagation();
        });
        
        // Make compact for chat recommendations if needed
        if (compact) {
            card.classList.add('compact-card');
        }
        
        return card;
    }

    
    // Format podcast duration
    function formatDuration(minutes) {
        if (!minutes) return 'Unknown duration';
        
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            
            if (remainingMinutes === 0) {
                return `${hours} hr`;
            } else {
                return `${hours} hr ${remainingMinutes} min`;
            }
        }
    }
    
    // Perform advanced search
    function performAdvancedSearch() {
        console.log("Performing advanced search");
        
        if (!searchResults) {
            console.error("searchResults element not found");
            return;
        }
        
        // Show loading indicator
        searchResults.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
        
        // Get selected categories
        const selectedCategories = Array.from(
            document.querySelectorAll('#categoryCheckboxes input[type="checkbox"]:checked')
        ).map(checkbox => checkbox.value);
        
        console.log("Selected categories:", selectedCategories);
        
        // Get selected duration
        const selectedDuration = document.querySelector('input[name="duration"]:checked').value;
        console.log("Selected duration:", selectedDuration);
        
        // Get minimum popularity rating
        const minPopularity = parseFloat(popularitySlider.value);
        console.log("Minimum popularity:", minPopularity);
        
        // Filter podcasts based on criteria
        let results = [...allPodcasts];
        
        // Filter by categories (if any selected)
        if (selectedCategories.length > 0) {
            results = results.filter(podcast => 
                selectedCategories.some(category => podcast.categories.includes(category))
            );
        }
        
        // Filter by duration
        if (selectedDuration !== 'any') {
            results = results.filter(podcast => {
                const duration = podcast.avg_episode_length || podcast.avg_duration || 0;
                
                switch (selectedDuration) {
                    case 'short':
                        return duration < 30;
                    case 'medium':
                        return duration >= 30 && duration <= 60;
                    case 'long':
                        return duration > 60;
                    default:
                        return true;
                }
            });
        }
        
        // Filter by popularity
        results = results.filter(podcast => podcast.popularity >= minPopularity);
        
        // Sort by popularity (highest first)
        results.sort((a, b) => b.popularity - a.popularity);
        
        console.log(`Found ${results.length} podcasts matching criteria`);
        
        // Display results (with artificial delay for UX)
        setTimeout(() => {
            searchResults.innerHTML = '';
            
            if (results.length === 0) {
                console.log("No results found");
                searchResults.innerHTML = '<p class="no-results">No podcasts match your criteria. Try adjusting your filters.</p>';
                return;
            }
            
            results.forEach(podcast => {
                searchResults.appendChild(createPodcastCard(podcast));
            });
        }, 800);
    }

 
    document.addEventListener("DOMContentLoaded", function () {
        const privacyLink = document.querySelector('a[href="#copyright"]');
        const copyright = document.getElementById("copyright");

        privacyLink.addEventListener("click", function () {
            // Remove and re-add the class to re-trigger animation
            copyright.classList.remove("highlight");
            void copyright.offsetWidth; // Trigger reflow
            copyright.classList.add("highlight");
        });
    });

    let searchModeActive = false;

// Add this to your existing event listeners
if (userInput) {
    userInput.addEventListener('input', function() {
        // Check if input starts with "/search" to activate search mode
        if (this.value.trim().startsWith('/search')) {
            activateSearchMode();
        } else if (searchModeActive && !this.value.trim().startsWith('/search')) {
            deactivateSearchMode();
        }
    });
}

// Function to activate search mode
function activateSearchMode() {
    if (!searchModeActive) {
        searchModeActive = true;
        
        // Visual feedback that search mode is active
        userInput.classList.add('search-mode');
        
        // Add placeholder text
        const originalPlaceholder = userInput.placeholder;
        userInput.dataset.originalPlaceholder = originalPlaceholder;
        userInput.placeholder = "Search for podcasts... (Press Enter to search)";
        
        // Add a search icon or indicator if needed
        const searchIndicator = document.createElement('div');
        searchIndicator.id = 'searchModeIndicator';
        searchIndicator.innerHTML = '<i class="fas fa-search"></i> Search Mode';
        searchIndicator.className = 'search-mode-indicator';
        
        // Insert before the chat container
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer && !document.getElementById('searchModeIndicator')) {
            chatContainer.parentNode.insertBefore(searchIndicator, chatContainer);
        }
        
        // Change the send button icon to a search icon
        if (sendButton) {
            sendButton.innerHTML = '<i class="fas fa-search"></i>';
            sendButton.dataset.originalHtml = sendButton.innerHTML;
        }
    }
}

// Function to deactivate search mode
function deactivateSearchMode() {
    if (searchModeActive) {
        searchModeActive = false;
        
        // Remove visual feedback
        userInput.classList.remove('search-mode');
        
        // Restore original placeholder
        if (userInput.dataset.originalPlaceholder) {
            userInput.placeholder = userInput.dataset.originalPlaceholder;
        }
        
        // Remove search indicator
        const searchIndicator = document.getElementById('searchModeIndicator');
        if (searchIndicator) {
            searchIndicator.remove();
        }
        
        // Restore original send button
        if (sendButton && sendButton.dataset.originalHtml) {
            sendButton.innerHTML = sendButton.dataset.originalHtml;
        }
    }
}

// Modify the sendMessage function to handle search mode
function sendMessageCore() {
    console.log("sendMessageCore function called");
    
    if (!userInput) {
      console.error("userInput element is null");
      return;
    }
    
    const message = userInput.value.trim();
    console.log("User message:", message);
    
    if (!message) {
      console.log("Message is empty, not sending");
      return;
    }
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Clear input
    userInput.value = '';
    
    // Show simple loading message instead of typing animation
    showLoadingMessage();
    
    console.log("Sending message to backend...");
    
    // Send to backend
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message })
    })
    .then(response => {
      console.log("Response received, status:", response.status);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Response data:", data);
        
      // Remove loading message
      removeLoadingMessage();
      
      // Add delay before showing the response (500ms = 0.5 seconds)
      setTimeout(() => {
        // Add bot response without animation
        addMessageToChat(data.message, 'bot');
    
        // If recommendations were provided, display them
        if (data.recommendations && data.recommendations.length > 0) {
          console.log(`Displaying ${data.recommendations.length} recommendations`);
          displayRecommendations(data.recommendations);
        }
        
        // Simple instant scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 800); // Adjust this number to control the delay in milliseconds
    })
    .catch(error => {
      console.error('Error in fetch:', error);
      removeLoadingMessage();
      addMessageToChat("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }
  
  // Function to handle both regular messages and search mode
  function sendMessage() {
    if (!userInput) {
      console.error("userInput element is null");
      return;
    }
    
    const message = userInput.value.trim();
    
    if (!message) {
      console.log("Message is empty, not sending");
      return;
    }
    
    // Check if in search mode
    if (searchModeActive || message.startsWith('/search')) {
      // Extract search query (remove the "/search" prefix)
      const searchQuery = message.replace(/^\/search\s*/, '').trim();
      
      if (searchQuery) {
        // Perform search instead of regular chat
        performPodcastSearch(searchQuery);
      } else {
        // Just activated search mode without a query
        activateSearchMode();
      }
    } else {
      // Use original sendMessage functionality
      sendMessageCore();
    }
  }

// Function to perform podcast search
function performPodcastSearch(query) {
    console.log("Performing podcast search for:", query);
    
    // Add user message to chat
    addMessageToChat(`/search ${query}`, 'user');
    
    // Clear input
    userInput.value = '';
    
    // Show loading message
    showLoadingMessage();
    
    // Prepare search parameters
    const searchParams = {
        query: query.toLowerCase(),
        type: 'podcast'  // You can expand this later for other types
    };
    
    // Make API request to search endpoint
    fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchParams)
    })
    .then(response => {
        console.log("Search response received, status:", response.status);
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Search results:", data);
        
        // Remove loading message
        removeLoadingMessage();
        
        // Process and display search results
        displaySearchResults(query, data.results);
        
        // Deactivate search mode after search
        deactivateSearchMode();
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    })
    .catch(error => {
        console.error('Error in search:', error);
        removeLoadingMessage();
        addMessageToChat("Sorry, I couldn't complete your search. Please try again later.", 'bot');
        
        // Deactivate search mode
        deactivateSearchMode();
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Function to display search results in chat
function displaySearchResults(query, results) {
    console.log("Displaying search results in chat");
    
    if (!results || results.length === 0) {
        // No results found
        addMessageToChat(`No podcasts found matching "${query}". Try a different search term.`, 'bot');
        return;
    }
    
    // Create a message with search summary
    const summaryMessage = `Found ${results.length} podcast${results.length > 1 ? 's' : ''} matching "${query}":`;
    
    // Create container for results
    const resultDiv = document.createElement('div');
    resultDiv.classList.add('message', 'bot-message');
    
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-robot');
    
    avatar.appendChild(icon);
    
    const content = document.createElement('div');
    content.classList.add('message-content');
    
    // Add summary text
    const summaryText = document.createElement('p');
    summaryText.textContent = summaryMessage;
    content.appendChild(summaryText);
    
    // Create a grid for podcast results similar to recommendations
    const grid = document.createElement('div');
    grid.classList.add('chatbot-podcast-grid');
    
    // Add podcasts to grid
    results.forEach(podcast => {
        const card = createCompactPodcastCard(podcast);
        grid.appendChild(card);
    });
    
    content.appendChild(grid);
    resultDiv.appendChild(avatar);
    resultDiv.appendChild(content);
    
    chatMessages.appendChild(resultDiv);
}

// Helper function: Local client-side search if API fails
function clientSideSearch(query) {
    console.log("Performing client-side search as fallback");
    
    if (!allPodcasts || allPodcasts.length === 0) {
        console.error("No podcast data available for client-side search");
        return [];
    }
    
    const queryLower = query.toLowerCase();
    return allPodcasts.filter(podcast => {
        // Search in title
        if (podcast.title.toLowerCase().includes(queryLower)) return true;
        
        // Search in host
        if (podcast.host.toLowerCase().includes(queryLower)) return true;
        
        // Search in description
        if (podcast.description.toLowerCase().includes(queryLower)) return true;
        
        // Search in categories
        if (podcast.categories.some(cat => cat.toLowerCase().includes(queryLower))) return true;
        
        return false;
    }).sort((a, b) => b.popularity - a.popularity);
}

=======
// static/js/main.js - Updated for larger chatbot

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    
    // DOM Elements
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const categoryButtons = document.getElementById('categoryButtons');
    const podcastGrid = document.getElementById('podcastGrid');
    const categoryCheckboxes = document.getElementById('categoryCheckboxes');
    const popularitySlider = document.getElementById('popularitySlider');
    const popularityValue = document.getElementById('popularityValue');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    // Log if any elements are missing
    if (!chatMessages) console.error("Element #chatMessages not found");
    if (!userInput) console.error("Element #userInput not found");
    if (!sendButton) console.error("Element #sendButton not found");
    
    // Templates
    const podcastCardTemplate = document.getElementById('podcast-card-template');
    if (!podcastCardTemplate) console.error("Podcast card template not found");

    // State
    let allPodcasts = [];
    let allCategories = [];
    let selectedCategory = '';

    // Initialize
    console.log("Initializing app...");
    fetchCategories();
    fetchPodcasts();

    // Event listeners
    if (userInput) {
        userInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                console.log("Enter pressed in input");
                sendMessage();
            }
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', function() {
            console.log("Send button clicked");
            sendMessage();
        });
    }

    if (popularitySlider) {
        popularitySlider.addEventListener('input', function() {
            popularityValue.textContent = this.value;
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', performAdvancedSearch);
    }

    // Fetch all podcasts
    function fetchPodcasts() {
        console.log("Fetching podcasts...");
        fetch('/api/podcasts')
            .then(response => {
                console.log("Podcast response status:", response.status);
                return response.json();
            })
            .then(data => {
                console.log(`Received ${data.length} podcasts`);
                allPodcasts = data;
                displayFeaturedPodcasts();
            })
            .catch(error => console.error('Error fetching podcasts:', error));
    }

    // Fetch all categories
    function fetchCategories() {
        console.log("Fetching categories...");
        fetch('/api/categories')
            .then(response => {
                console.log("Categories response status:", response.status);
                return response.json();
            })
            .then(data => {
                console.log(`Received ${data.length} categories`);
                allCategories = data;
                populateCategoryCheckboxes();
                setupCategoryFilters();
            })
            .catch(error => console.error('Error fetching categories:', error));
    }

    // Display featured (popular) podcasts
    function displayFeaturedPodcasts() {
        console.log("Displaying featured podcasts");
        if (!podcastGrid) {
            console.error("podcastGrid element not found");
            return;
        }
        
        // Clear loading spinner
        podcastGrid.innerHTML = '';
        
        if (allPodcasts.length === 0) {
            console.log("No podcasts available to display");
            return;
        }
        
        // Sort by popularity and get top 6
        const featured = [...allPodcasts]
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 6);
            
        console.log(`Displaying ${featured.length} featured podcasts`);
            
        // Add to grid
        featured.forEach(podcast => {
            podcastGrid.appendChild(createPodcastCard(podcast));
        });
    }

    let podcastDetailsModal;
    
    // Create and append the podcast details modal to the body
    function createPodcastDetailsModal() {
        // Create the modal container if it doesn't exist yet
        if (!podcastDetailsModal) {
            podcastDetailsModal = document.createElement('div');
            podcastDetailsModal.id = 'podcastDetailsModal';
            podcastDetailsModal.className = 'podcast-details-modal';
            
            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.className = 'podcast-details-content';
            
            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-modal';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', closePodcastDetailsModal);
            
            // Podcast details will be inserted here
            const detailsContainer = document.createElement('div');
            detailsContainer.id = 'podcastDetailsContainer';
            detailsContainer.className = 'podcast-details-container';
            
            // Assemble modal
            modalContent.appendChild(closeBtn);
            modalContent.appendChild(detailsContainer);
            podcastDetailsModal.appendChild(modalContent);
            
            // Add click event to close modal when clicking outside content
            podcastDetailsModal.addEventListener('click', function(event) {
                if (event.target === podcastDetailsModal) {
                    closePodcastDetailsModal();
                }
            });
            
            // Add key event to close modal with Escape key
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape' && podcastDetailsModal.classList.contains('show')) {
                    closePodcastDetailsModal();
                }
            });
            
            // Add to document
            document.body.appendChild(podcastDetailsModal);
        }
    }
    
    // Show podcast details in modal
    function showPodcastDetails(podcast) {
        console.log("Showing details for podcast:", podcast.title);
        
        // Ensure modal exists
        createPodcastDetailsModal();
        
        const detailsContainer = document.getElementById('podcastDetailsContainer');
        
        // Clear previous content
        detailsContainer.innerHTML = '';
        
        // Create detailed view of podcast
        const detailsContent = document.createElement('div');
        detailsContent.className = 'podcast-full-details';
        
        // Header with image and basic info
        const header = document.createElement('div');
        header.className = 'podcast-details-header';
        
        // Image
        const imageContainer = document.createElement('div');
        imageContainer.className = 'podcast-details-image';
        const image = document.createElement('img');
        image.src = podcast.image_url || '/static/images/podcasts/generic1.jpg';
        image.alt = podcast.title;
        imageContainer.appendChild(image);
        
        // Info section
        const infoContainer = document.createElement('div');
        infoContainer.className = 'podcast-details-info';
        
        // Title
        const title = document.createElement('h2');
        title.textContent = podcast.title;
        title.className = 'podcast-details-title';
        
        // Host
        const host = document.createElement('p');
        host.className = 'podcast-details-host';
        host.innerHTML = `<strong>Hosted by:</strong> ${podcast.host}`;
        
        // Rating display
        const ratingDisplay = document.createElement('div');
        ratingDisplay.className = 'podcast-details-rating';
        
        // Rating value
        const ratingValue = document.createElement('span');
        ratingValue.textContent = podcast.popularity.toFixed(1);
        ratingValue.className = 'rating-value';
        
        // Stars
        const stars = document.createElement('div');
        stars.className = 'rating-stars';
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('i');
            if (i < Math.floor(podcast.popularity / 2)) {
                star.className = 'fas fa-star';
            } else if (i === Math.floor(podcast.popularity / 2) && podcast.popularity % 2 >= 1) {
                star.className = 'fas fa-star-half-alt';
            } else {
                star.className = 'far fa-star';
            }
            stars.appendChild(star);
        }
        
        ratingDisplay.appendChild(ratingValue);
        ratingDisplay.appendChild(stars);
        
        // Average episode length
        const duration = document.createElement('p');
        duration.className = 'podcast-details-duration';
        duration.innerHTML = `<i class="fas fa-clock"></i> <strong>Average episode:</strong> ${formatDuration(podcast.avg_episode_length)}`;
        
        // Categories
        const categories = document.createElement('div');
        categories.className = 'podcast-details-categories';
        categories.innerHTML = '<strong>Categories:</strong> ';
        
        const categoryList = document.createElement('div');
        categoryList.className = 'categories-list';
        
        podcast.categories.forEach(category => {
            const categoryTag = document.createElement('span');
            categoryTag.className = 'podcast-category';
            categoryTag.textContent = category;
            categoryList.appendChild(categoryTag);
        });
        
        categories.appendChild(categoryList);
        
        // Listen button
        const listenBtn = document.createElement('a');
        listenBtn.href = podcast.spotify_url || '#';
        listenBtn.className = 'listen-button details-listen-button';
        listenBtn.target = '_blank';
        listenBtn.innerHTML = '<i class="fab fa-spotify"></i> Listen on Spotify';
        
        // Assemble info container
        infoContainer.appendChild(title);
        infoContainer.appendChild(host);
        infoContainer.appendChild(ratingDisplay);
        infoContainer.appendChild(duration);
        infoContainer.appendChild(categories);
        infoContainer.appendChild(listenBtn);
        
        // Assemble header
        header.appendChild(imageContainer);
        header.appendChild(infoContainer);
        
        // Description section
        const descriptionSection = document.createElement('div');
        descriptionSection.className = 'podcast-details-description';
        
        const descriptionTitle = document.createElement('h3');
        descriptionTitle.textContent = 'About This Podcast';
        
        const description = document.createElement('p');
        description.textContent = podcast.description;
        
        descriptionSection.appendChild(descriptionTitle);
        descriptionSection.appendChild(description);
        
        // Episodes section (placeholder - would normally fetch real episodes)
        const episodesSection = document.createElement('div');
        episodesSection.className = 'podcast-details-episodes';
        
        const episodesTitle = document.createElement('h3');
        episodesTitle.textContent = 'Recent Episodes';
        
        const episodesList = document.createElement('ul');
        episodesList.className = 'episodes-list';
        
        // Sample episodes (in a real app, these would be fetched from an API)
        const sampleEpisodes = [
            { title: `${podcast.title} - Latest Episode`, duration: Math.floor(Math.random() * 20) + podcast.avg_episode_length },
            { title: `${podcast.title} - Fan Favorite`, duration: Math.floor(Math.random() * 20) + podcast.avg_episode_length - 5 },
            { title: `${podcast.title} - Special Guest`, duration: Math.floor(Math.random() * 20) + podcast.avg_episode_length + 10 }
        ];
        
        sampleEpisodes.forEach(episode => {
            const episodeItem = document.createElement('li');
            episodeItem.className = 'episode-item';
            
            const episodeTitle = document.createElement('h4');
            episodeTitle.textContent = episode.title;
            
            const episodeDuration = document.createElement('span');
            episodeDuration.className = 'episode-duration';
            episodeDuration.innerHTML = `<i class="fas fa-clock"></i> ${formatDuration(episode.duration)}`;
            
            const playButton = document.createElement('button');
            playButton.className = 'episode-play-button';
            playButton.innerHTML = '<i class="fas fa-play"></i> Play';
            
            episodeItem.appendChild(episodeTitle);
            episodeItem.appendChild(episodeDuration);
            episodeItem.appendChild(playButton);
            
            episodesList.appendChild(episodeItem);
        });
        
        episodesSection.appendChild(episodesTitle);
        episodesSection.appendChild(episodesList);
        
        // Assemble all sections
        detailsContent.appendChild(header);
        detailsContent.appendChild(descriptionSection);
        detailsContent.appendChild(episodesSection);
        
        // Add to container
        detailsContainer.appendChild(detailsContent);
        
        // Show modal with animation
        podcastDetailsModal.classList.add('show');
    }
    
    // Close podcast details modal
    function closePodcastDetailsModal() {
        if (podcastDetailsModal) {
            podcastDetailsModal.classList.remove('show');
        }
    }

    // Setup category filter buttons
    function setupCategoryFilters() {
        if (!categoryButtons) {
            console.error("categoryButtons element not found");
            return;
        }
        
        console.log("Setting up category filters");
        
        // Clear existing buttons
        categoryButtons.innerHTML = '';
        
        // Add "All" button
        const allButton = document.createElement('button');
        allButton.classList.add('category-button', 'active');
        allButton.textContent = 'All';
        allButton.addEventListener('click', () => {
            // Update active button
            document.querySelectorAll('.category-button').forEach(btn => 
                btn.classList.remove('active')
            );
            allButton.classList.add('active');
            
            // Reset selection and display featured
            selectedCategory = '';
            displayFeaturedPodcasts();
        });
        categoryButtons.appendChild(allButton);
        
        // Add category buttons
        allCategories.forEach(category => {
            const button = document.createElement('button');
            button.classList.add('category-button');
            button.textContent = category;
            button.dataset.category = category;
            
            button.addEventListener('click', () => {
                // Update active button
                document.querySelectorAll('.category-button').forEach(btn => 
                    btn.classList.remove('active')
                );
                button.classList.add('active');
                
                // Update selection and display filtered podcasts
                selectedCategory = category;
                displayPodcastsByCategory(category);
            });
            
            categoryButtons.appendChild(button);
        });
    }

    // Populate category checkboxes for advanced search
    function populateCategoryCheckboxes() {
        if (!categoryCheckboxes) {
            console.log("categoryCheckboxes element not found, skipping");
            return;
        }
        
        console.log("Populating category checkboxes");
        
        // Clear existing checkboxes
        categoryCheckboxes.innerHTML = '';
        
        // Add checkboxes for each category
        allCategories.forEach(category => {
            const label = document.createElement('label');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = category;
            checkbox.name = 'categories';
            
            const span = document.createElement('span');
            span.textContent = category;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            
            categoryCheckboxes.appendChild(label);
        });
    }

    // Send user message to chatbot
// Simplified functions without animations

// Send user message to chatbot
function sendMessage() {
    console.log("sendMessage function called");
  
    if (!userInput) {
      console.error("userInput element is null");
      return;
    }
  
    const message = userInput.value.trim();
    console.log("User message:", message);
  
    if (!message) {
      console.log("Message is empty, not sending");
      return;
    }
  
    // Add user message to chat
    addMessageToChat(message, 'user');
  
    // Clear input
    userInput.value = '';
  
    // Show simple loading message instead of typing animation
    showLoadingMessage();
  
    console.log("Sending message to backend...");
    
    // Send to backend
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message })
    })
    .then(response => {
      console.log("Response received, status:", response.status);
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
        console.log("Response data:", data);
        
        // Remove loading message
        removeLoadingMessage();
      
        // Add delay before showing the response (500ms = 0.5 seconds)
        setTimeout(() => {
          // Add bot response without animation
          addMessageToChat(data.message, 'bot');
      
          // If recommendations were provided, display them
          if (data.recommendations && data.recommendations.length > 0) {
            console.log(`Displaying ${data.recommendations.length} recommendations`);
            displayRecommendations(data.recommendations);
          }
          
          // Simple instant scroll to bottom
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 800); // Adjust this number to control the delay in milliseconds
      })
    .catch(error => {
      console.error('Error in fetch:', error);
      removeLoadingMessage();
      addMessageToChat("Sorry, I'm having trouble connecting. Please try again later.", 'bot');
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }
  
  // Simplified add message function
  function addMessageToChat(message, sender) {
    console.log(`Adding ${sender} message to chat`);
  
    if (!chatMessages) {
      console.error("chatMessages element not found");
      return;
    }
  
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender + '-message');
  
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
  
    const icon = document.createElement('i');
    if (sender === 'bot') {
      icon.classList.add('fas', 'fa-robot');
    } else {
      icon.classList.add('fas', 'fa-user');
    }
  
    avatar.appendChild(icon);
  
    const content = document.createElement('div');
    content.classList.add('message-content');
    
    // Ensure message content has proper width constraints
    content.style.width = '100%';
    content.style.maxWidth = '95%';
    content.style.wordWrap = 'break-word';
    content.style.overflowWrap = 'break-word';
  
    // Standard display without animations
    if (message.includes('\n')) {
      const paragraphs = message.split('\n').filter(para => para.trim() !== '');
      paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        p.style.width = '100%';
        p.style.wordWrap = 'break-word';
        p.style.overflowWrap = 'break-word';
        p.textContent = paragraph;
        content.appendChild(p);
      });
    } else {
      const p = document.createElement('p');
      p.style.width = '100%';
      p.style.wordWrap = 'break-word';
      p.style.overflowWrap = 'break-word';
      p.textContent = message;
      content.appendChild(p);
    }
  
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
  
    chatMessages.appendChild(messageDiv);
  
    // Simple instant scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Simple loading message instead of typing animation
  function showLoadingMessage() {
    console.log("Showing loading message");
  
    if (!chatMessages) {
      console.error("chatMessages element not found");
      return;
    }
  
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot-message', 'loading-message');
    loadingDiv.id = 'loading-message';
  
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
  
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-robot');
  
    avatar.appendChild(icon);
  
    const content = document.createElement('div');
    content.classList.add('message-content');
  
    const text = document.createElement('p');
    text.textContent = "Loading response...";
    content.appendChild(text);
  
    loadingDiv.appendChild(avatar);
    loadingDiv.appendChild(content);
  
    chatMessages.appendChild(loadingDiv);
    
    // Simple instant scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Remove loading message
  function removeLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }
  
  // Display recommendations without animations
  function displayRecommendations(recommendations) {
    console.log("Displaying podcast recommendations in chat");
    
    // Create container for recommendations
    const recDiv = document.createElement('div');
    recDiv.classList.add('podcast-recommendations');
  
    // Add heading
    const heading = document.createElement('h3');
    heading.textContent = 'Recommended Podcasts';
    heading.style.marginBottom = '15px';
    recDiv.appendChild(heading);
  
    // Create a grid for podcasts
    const grid = document.createElement('div');
    grid.classList.add('chatbot-podcast-grid');
  
    // Add podcasts to grid
    recommendations.forEach(podcast => {
      // Create a more compact card for the chat
      const card = createCompactPodcastCard(podcast);
      grid.appendChild(card);
    });
  
    recDiv.appendChild(grid);
  
    // Add to chat as a bot message
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot-message');
  
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
  
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-robot');
  
    avatar.appendChild(icon);
  
    const content = document.createElement('div');
    content.classList.add('message-content');
    content.style.maxWidth = '95%'; // Allow recommendations to use more space
  
    content.appendChild(recDiv);
  
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
  
    chatMessages.appendChild(messageDiv);
  
    // Simple instant scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

    // Show typing indicator
    function showTypingIndicator() {
        console.log("Showing typing indicator");
        
        if (!chatMessages) {
            console.error("chatMessages element not found");
            return;
        }
        
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
        
        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar');
        
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-robot');
        
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.classList.add('message-content');
        
        const dots = document.createElement('p');
        dots.innerHTML = '<span>●</span><span>●</span><span>●</span>';
        dots.classList.add('typing-dots');
        
        content.appendChild(dots);
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        
        chatMessages.appendChild(typingDiv);
        
        // Scroll to bottom of chat with a smooth animation
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        console.log("Removing typing indicator");
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        } else {
            console.log("No typing indicator found to remove");
        }
    }
    
    // Display podcasts by category
    function displayPodcastsByCategory(category) {
        console.log(`Displaying podcasts for category: ${category}`);
        // Show loading spinner
        podcastGrid.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
        
        // Filter podcasts by category
        const filteredPodcasts = allPodcasts.filter(podcast => 
            podcast.categories.includes(category)
        );
        
        console.log(`Found ${filteredPodcasts.length} podcasts in category ${category}`);
        
        // Clear and display results
        setTimeout(() => {
            podcastGrid.innerHTML = '';
            
            if (filteredPodcasts.length === 0) {
                console.log("No podcasts found in this category");
                podcastGrid.innerHTML = '<p class="no-results">No podcasts found in this category.</p>';
                return;
            }
            
            filteredPodcasts.forEach(podcast => {
                podcastGrid.appendChild(createPodcastCard(podcast));
            });
        }, 500); // Simulated loading delay
    }

    // Display podcast recommendations in chat - Enhanced for larger chat window
    function displayRecommendations(recommendations) {
        console.log("Displaying podcast recommendations in chat");
        // Create container for recommendations
        const recDiv = document.createElement('div');
        recDiv.classList.add('podcast-recommendations');
        
        // Add heading
        const heading = document.createElement('h3');
        heading.textContent = 'Recommended Podcasts';
        heading.style.marginBottom = '15px';
        recDiv.appendChild(heading);
        
        // Create a grid for podcasts - use chatbot-podcast-grid for chat recommendations
        const grid = document.createElement('div');
        grid.classList.add('chatbot-podcast-grid');
        
        // Add podcasts to grid - show up to 3 per row in the larger chat window
        recommendations.forEach(podcast => {
            // Create a more compact card for the chat
            const card = createCompactPodcastCard(podcast);
            grid.appendChild(card);
        });
        
        recDiv.appendChild(grid);
        
        // Add to chat as a bot message
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        
        const avatar = document.createElement('div');
        avatar.classList.add('message-avatar');
        
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-robot');
        
        avatar.appendChild(icon);
        
        const content = document.createElement('div');
        content.classList.add('message-content');
        content.style.maxWidth = '95%'; // Allow recommendations to use more space
        
        content.appendChild(recDiv);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom of chat with smooth animation
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Create compact podcast card specifically for chat recommendations
    function createCompactPodcastCard(podcast) {
        const card = document.createElement('div');
        card.classList.add('chatbot-podcast-card');
        
        // Make entire card clickable
        card.addEventListener('click', function() {
            showPodcastDetails(podcast);
        });
        card.style.cursor = 'pointer';
        
        // Image
        const imageDiv = document.createElement('div');
        imageDiv.classList.add('chatbot-podcast-image');
        const img = document.createElement('img');
        img.src = podcast.image_url || '/static/images/podcasts/generic1.jpg';
        img.alt = podcast.title;
        imageDiv.appendChild(img);
        
        // Info
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('chatbot-podcast-info');
        
        // Title
        const title = document.createElement('h4');
        title.textContent = podcast.title;
        
        // Host
        const host = document.createElement('div');
        host.classList.add('chatbot-podcast-host');
        host.textContent = `Hosted by ${podcast.host}`;
        
        // Rating
        const rating = document.createElement('div');
        rating.classList.add('chatbot-podcast-rating');
        const ratingValue = document.createElement('span');
        ratingValue.textContent = podcast.popularity.toFixed(1);
        const stars = document.createElement('div');
        stars.classList.add('rating-stars');
        
        // Create stars
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('i');
            if (i < Math.floor(podcast.popularity / 2)) {
                star.className = 'fas fa-star';
            } else if (i === Math.floor(podcast.popularity / 2) && podcast.popularity % 2 >= 1) {
                star.className = 'fas fa-star-half-alt';
            } else {
                star.className = 'far fa-star';
            }
            stars.appendChild(star);
        }
        rating.appendChild(ratingValue);
        rating.appendChild(stars);
        
        // Categories
        const categories = document.createElement('div');
        categories.classList.add('chatbot-podcast-categories');
        podcast.categories.forEach(category => {
            const categorySpan = document.createElement('span');
            categorySpan.classList.add('chatbot-podcast-category');
            categorySpan.textContent = category;
            categories.appendChild(categorySpan);
        });
        
        // Duration
        const duration = document.createElement('div');
        duration.classList.add('chatbot-podcast-duration');
        const clockIcon = document.createElement('i');
        clockIcon.classList.add('fas', 'fa-clock');
        const durationText = document.createElement('span');
        durationText.textContent = formatDuration(podcast.avg_episode_length);
        duration.appendChild(clockIcon);
        duration.appendChild(durationText);
        
        // Description
        const description = document.createElement('p');
        description.classList.add('chatbot-podcast-description');
        description.textContent = podcast.description;
        
        // Listen button - Modified to stop propagation
        const listenBtn = document.createElement('a');
        listenBtn.href = podcast.spotify_url || '#';
        listenBtn.classList.add('chatbot-listen-button');
        listenBtn.target = '_blank';
        listenBtn.addEventListener('click', function(event) {
            // Prevent triggering the card click when clicking the listen button
            event.stopPropagation();
        });
        
        const spotifyIcon = document.createElement('i');
        spotifyIcon.classList.add('fab', 'fa-spotify');
        listenBtn.appendChild(spotifyIcon);
        listenBtn.appendChild(document.createTextNode('Listen on Spotify'));
        
        // Append all elements
        infoDiv.appendChild(title);
        infoDiv.appendChild(host);
        infoDiv.appendChild(rating);
        infoDiv.appendChild(categories);
        infoDiv.appendChild(duration);
        infoDiv.appendChild(description);
        infoDiv.appendChild(listenBtn);
        
        card.appendChild(imageDiv);
        card.appendChild(infoDiv);
        
        return card;
    }
    
    // Also modify the main podcast cards to show details
    function createPodcastCard(podcast, compact = false) {
        // Check if template exists
        if (!podcastCardTemplate) {
            console.error("Podcast card template not found");
            return document.createElement('div');
        }
        
        console.log(`Creating card for podcast: ${podcast.title}`);
        
        // Clone template
        const card = document.importNode(podcastCardTemplate.content, true).querySelector('.podcast-card');
        
        // Add click event to show details
        card.addEventListener('click', function(event) {
            // Prevent default if it's a link or button
            if (event.target.tagName !== 'A' && event.target.tagName !== 'BUTTON') {
                showPodcastDetails(podcast);
            }
        });
        card.style.cursor = 'pointer';
        
        // Fill in data
        card.querySelector('.podcast-image img').src = podcast.image_url || '/static/images/podcasts/generic1.jpg';
        card.querySelector('.podcast-image img').alt = podcast.title;
        card.querySelector('.podcast-title').textContent = podcast.title;
        card.querySelector('.podcast-host').textContent = `Hosted by ${podcast.host}`;
        
        // Rating
        const ratingValue = card.querySelector('.rating-value');
        ratingValue.textContent = podcast.popularity.toFixed(1);
        
        const ratingStars = card.querySelector('.rating-stars');
        ratingStars.innerHTML = '';
        
        // Create rating stars (full, half or empty)
        const fullStars = Math.floor(podcast.popularity / 2);
        const hasHalfStar = (podcast.popularity / 2) % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('i');
            if (i < fullStars) {
                star.className = 'fas fa-star';
            } else if (i === fullStars && hasHalfStar) {
                star.className = 'fas fa-star-half-alt';
            } else {
                star.className = 'far fa-star';
            }
            ratingStars.appendChild(star);
        }
        
        // Categories
        const categoriesContainer = card.querySelector('.podcast-categories');
        categoriesContainer.innerHTML = '';
        
        podcast.categories.forEach(category => {
            const span = document.createElement('span');
            span.className = 'podcast-category';
            span.textContent = category;
            categoriesContainer.appendChild(span);
        });
        
        // Duration
        const avgDuration = podcast.avg_episode_length || podcast.avg_duration || 0;
        card.querySelector('.podcast-duration span').textContent = formatDuration(avgDuration);
        
        // Description
        card.querySelector('.podcast-description').textContent = podcast.description;
        
        // Listen button - prevent propagation
        const listenButton = card.querySelector('.listen-button');
        listenButton.href = podcast.spotify_url || '#';
        listenButton.addEventListener('click', function(event) {
            event.stopPropagation();
        });
        
        // Make compact for chat recommendations if needed
        if (compact) {
            card.classList.add('compact-card');
        }
        
        return card;
    }

    
    // Format podcast duration
    function formatDuration(minutes) {
        if (!minutes) return 'Unknown duration';
        
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            
            if (remainingMinutes === 0) {
                return `${hours} hr`;
            } else {
                return `${hours} hr ${remainingMinutes} min`;
            }
        }
    }
    
    // Perform advanced search
    function performAdvancedSearch() {
        console.log("Performing advanced search");
        
        if (!searchResults) {
            console.error("searchResults element not found");
            return;
        }
        
        // Show loading indicator
        searchResults.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>';
        
        // Get selected categories
        const selectedCategories = Array.from(
            document.querySelectorAll('#categoryCheckboxes input[type="checkbox"]:checked')
        ).map(checkbox => checkbox.value);
        
        console.log("Selected categories:", selectedCategories);
        
        // Get selected duration
        const selectedDuration = document.querySelector('input[name="duration"]:checked').value;
        console.log("Selected duration:", selectedDuration);
        
        // Get minimum popularity rating
        const minPopularity = parseFloat(popularitySlider.value);
        console.log("Minimum popularity:", minPopularity);
        
        // Filter podcasts based on criteria
        let results = [...allPodcasts];
        
        // Filter by categories (if any selected)
        if (selectedCategories.length > 0) {
            results = results.filter(podcast => 
                selectedCategories.some(category => podcast.categories.includes(category))
            );
        }
        
        // Filter by duration
        if (selectedDuration !== 'any') {
            results = results.filter(podcast => {
                const duration = podcast.avg_episode_length || podcast.avg_duration || 0;
                
                switch (selectedDuration) {
                    case 'short':
                        return duration < 30;
                    case 'medium':
                        return duration >= 30 && duration <= 60;
                    case 'long':
                        return duration > 60;
                    default:
                        return true;
                }
            });
        }
        
        // Filter by popularity
        results = results.filter(podcast => podcast.popularity >= minPopularity);
        
        // Sort by popularity (highest first)
        results.sort((a, b) => b.popularity - a.popularity);
        
        console.log(`Found ${results.length} podcasts matching criteria`);
        
        // Display results (with artificial delay for UX)
        setTimeout(() => {
            searchResults.innerHTML = '';
            
            if (results.length === 0) {
                console.log("No results found");
                searchResults.innerHTML = '<p class="no-results">No podcasts match your criteria. Try adjusting your filters.</p>';
                return;
            }
            
            results.forEach(podcast => {
                searchResults.appendChild(createPodcastCard(podcast));
            });
        }, 800);
    }

 
    document.addEventListener("DOMContentLoaded", function () {
        const privacyLink = document.querySelector('a[href="#copyright"]');
        const copyright = document.getElementById("copyright");

        privacyLink.addEventListener("click", function () {
            // Remove and re-add the class to re-trigger animation
            copyright.classList.remove("highlight");
            void copyright.offsetWidth; // Trigger reflow
            copyright.classList.add("highlight");
        });
    });

    let searchModeActive = false;

// Add this to your existing event listeners
if (userInput) {
    userInput.addEventListener('input', function() {
        // Check if input starts with "/search" to activate search mode
        if (this.value.trim().startsWith('/search')) {
            activateSearchMode();
        } else if (searchModeActive && !this.value.trim().startsWith('/search')) {
            deactivateSearchMode();
        }
    });
}

// Function to activate search mode
function activateSearchMode() {
    if (!searchModeActive) {
        searchModeActive = true;
        
        // Visual feedback that search mode is active
        userInput.classList.add('search-mode');
        
        // Add placeholder text
        const originalPlaceholder = userInput.placeholder;
        userInput.dataset.originalPlaceholder = originalPlaceholder;
        userInput.placeholder = "Search for podcasts... (Press Enter to search)";
        
        // Add a search icon or indicator if needed
        const searchIndicator = document.createElement('div');
        searchIndicator.id = 'searchModeIndicator';
        searchIndicator.innerHTML = '<i class="fas fa-search"></i> Search Mode';
        searchIndicator.className = 'search-mode-indicator';
        
        // Insert before the chat container
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer && !document.getElementById('searchModeIndicator')) {
            chatContainer.parentNode.insertBefore(searchIndicator, chatContainer);
        }
        
        // Change the send button icon to a search icon
        if (sendButton) {
            sendButton.innerHTML = '<i class="fas fa-search"></i>';
            sendButton.dataset.originalHtml = sendButton.innerHTML;
        }
    }
}

// Function to deactivate search mode
function deactivateSearchMode() {
    if (searchModeActive) {
        searchModeActive = false;
        
        // Remove visual feedback
        userInput.classList.remove('search-mode');
        
        // Restore original placeholder
        if (userInput.dataset.originalPlaceholder) {
            userInput.placeholder = userInput.dataset.originalPlaceholder;
        }
        
        // Remove search indicator
        const searchIndicator = document.getElementById('searchModeIndicator');
        if (searchIndicator) {
            searchIndicator.remove();
        }
        
        // Restore original send button
        if (sendButton && sendButton.dataset.originalHtml) {
            sendButton.innerHTML = sendButton.dataset.originalHtml;
        }
    }
}

// Modify the sendMessage function to handle search mode
const originalSendMessage = sendMessage;

// Replace the sendMessage function with this enhanced version
function sendMessage() {
    if (!userInput) {
        console.error("userInput element is null");
        return;
    }
    
    const message = userInput.value.trim();
    
    if (!message) {
        console.log("Message is empty, not sending");
        return;
    }
    
    // Check if in search mode
    if (searchModeActive || message.startsWith('/search')) {
        // Extract search query (remove the "/search" prefix)
        const searchQuery = message.replace(/^\/search\s*/, '').trim();
        
        if (searchQuery) {
            // Perform search instead of regular chat
            performPodcastSearch(searchQuery);
        } else {
            // Just activated search mode without a query
            activateSearchMode();
        }
    } else {
        // Use original sendMessage functionality
        originalSendMessage();
    }
}

// Function to perform podcast search
function performPodcastSearch(query) {
    console.log("Performing podcast search for:", query);
    
    // Add user message to chat
    addMessageToChat(`/search ${query}`, 'user');
    
    // Clear input
    userInput.value = '';
    
    // Show loading message
    showLoadingMessage();
    
    // Prepare search parameters
    const searchParams = {
        query: query.toLowerCase(),
        type: 'podcast'  // You can expand this later for other types
    };
    
    // Make API request to search endpoint
    fetch('/api/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchParams)
    })
    .then(response => {
        console.log("Search response received, status:", response.status);
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Search results:", data);
        
        // Remove loading message
        removeLoadingMessage();
        
        // Process and display search results
        displaySearchResults(query, data.results);
        
        // Deactivate search mode after search
        deactivateSearchMode();
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    })
    .catch(error => {
        console.error('Error in search:', error);
        removeLoadingMessage();
        addMessageToChat("Sorry, I couldn't complete your search. Please try again later.", 'bot');
        
        // Deactivate search mode
        deactivateSearchMode();
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Function to display search results in chat
function displaySearchResults(query, results) {
    console.log("Displaying search results in chat");
    
    if (!results || results.length === 0) {
        // No results found
        addMessageToChat(`No podcasts found matching "${query}". Try a different search term.`, 'bot');
        return;
    }
    
    // Create a message with search summary
    const summaryMessage = `Found ${results.length} podcast${results.length > 1 ? 's' : ''} matching "${query}":`;
    
    // Create container for results
    const resultDiv = document.createElement('div');
    resultDiv.classList.add('message', 'bot-message');
    
    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-robot');
    
    avatar.appendChild(icon);
    
    const content = document.createElement('div');
    content.classList.add('message-content');
    
    // Add summary text
    const summaryText = document.createElement('p');
    summaryText.textContent = summaryMessage;
    content.appendChild(summaryText);
    
    // Create a grid for podcast results similar to recommendations
    const grid = document.createElement('div');
    grid.classList.add('chatbot-podcast-grid');
    
    // Add podcasts to grid
    results.forEach(podcast => {
        const card = createCompactPodcastCard(podcast);
        grid.appendChild(card);
    });
    
    content.appendChild(grid);
    resultDiv.appendChild(avatar);
    resultDiv.appendChild(content);
    
    chatMessages.appendChild(resultDiv);
}

// Helper function: Local client-side search if API fails
function clientSideSearch(query) {
    console.log("Performing client-side search as fallback");
    
    if (!allPodcasts || allPodcasts.length === 0) {
        console.error("No podcast data available for client-side search");
        return [];
    }
    
    const queryLower = query.toLowerCase();
    return allPodcasts.filter(podcast => {
        // Search in title
        if (podcast.title.toLowerCase().includes(queryLower)) return true;
        
        // Search in host
        if (podcast.host.toLowerCase().includes(queryLower)) return true;
        
        // Search in description
        if (podcast.description.toLowerCase().includes(queryLower)) return true;
        
        // Search in categories
        if (podcast.categories.some(cat => cat.toLowerCase().includes(queryLower))) return true;
        
        return false;
    }).sort((a, b) => b.popularity - a.popularity);
}

>>>>>>> 8b039f1bf8654d19691af71c5bf08f5ad4056c64
});