// Simple horizontal scroll portfolio

document.addEventListener('DOMContentLoaded', function() {
  
  var container = document.getElementById('scrollContainer');
  
  if (!container) {
    console.error('No scroll container found!');
    return;
  }
  
  console.log('Scroll container found, setting up horizontal scroll...');
  
  // Track current section and prevent rapid scrolling
  var currentSection = 0;
  var isScrolling = false;
  var sections = document.querySelectorAll('.section');
  var totalSections = sections.length;
  
  // HORIZONTAL SCROLL - Snap to next/previous page
  function scrollToSection(index) {
    if (index < 0) index = 0;
    if (index >= totalSections) index = totalSections - 1;
    if (index === currentSection) return;
    
    currentSection = index;
    isScrolling = true;
    
    container.scrollTo({
      left: index * window.innerWidth,
      behavior: 'smooth'
    });
    
    // Prevent rapid scrolling
    setTimeout(function() {
      isScrolling = false;
    }, 600);
  }
  
  // Check if an element or its parents can scroll vertically
  function canScrollVertically(el) {
    while (el && el !== document.body) {
      var style = window.getComputedStyle(el);
      var overflowY = style.overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return { element: el, canScroll: true };
      }
      el = el.parentElement;
    }
    return { element: null, canScroll: false };
  }
  
  // Check if scrollable element is at its scroll boundary
  function isAtScrollBoundary(el, deltaY) {
    if (!el) return true;
    var atTop = el.scrollTop <= 0;
    var atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    
    // If scrolling up and at top, or scrolling down and at bottom
    if (deltaY < 0 && atTop) return true;
    if (deltaY > 0 && atBottom) return true;
    return false;
  }
  
  document.body.addEventListener('wheel', function(e) {
    if (document.body.classList.contains('modal-open')) return;
    if (isScrolling) return;
    
    // Check if we're inside a scrollable element
    var scrollCheck = canScrollVertically(e.target);
    
    // If inside scrollable content and not at boundary, allow normal scroll
    if (scrollCheck.canScroll && !isAtScrollBoundary(scrollCheck.element, e.deltaY)) {
      return; // Don't prevent default, allow vertical scrolling
    }
    
    e.preventDefault();
    
    // Determine scroll direction
    if (e.deltaY > 0) {
      // Scroll down = go right
      scrollToSection(currentSection + 1);
    } else if (e.deltaY < 0) {
      // Scroll up = go left
      scrollToSection(currentSection - 1);
    }
  }, { passive: false });
  
  container.addEventListener('wheel', function(e) {
    if (document.body.classList.contains('modal-open')) return;
    if (isScrolling) return;
    
    var scrollCheck = canScrollVertically(e.target);
    if (scrollCheck.canScroll && !isAtScrollBoundary(scrollCheck.element, e.deltaY)) {
      return;
    }
    
    e.preventDefault();
    
    if (e.deltaY > 0) {
      scrollToSection(currentSection + 1);
    } else if (e.deltaY < 0) {
      scrollToSection(currentSection - 1);
    }
  }, { passive: false });
  
  // KEYBOARD NAVIGATION
  document.addEventListener('keydown', function(e) {
    if (document.body.classList.contains('modal-open')) return;
    if (isScrolling) return;
    
    if (e.key === 'ArrowRight' || e.key === 'd') {
      e.preventDefault();
      scrollToSection(currentSection + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
      e.preventDefault();
      scrollToSection(currentSection - 1);
    }
  });
  
  // DRAG TO SCROLL - snap based on drag direction
  var isDragging = false;
  var startX = 0;
  var dragThreshold = 50; // minimum drag to trigger snap
  
  container.addEventListener('mousedown', function(e) {
    if (e.target.closest('a, button, .category-header, .view-more')) return;
    isDragging = true;
    startX = e.pageX;
    container.style.cursor = 'grabbing';
  });
  
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    e.preventDefault();
  });
  
  document.addEventListener('mouseup', function(e) {
    if (!isDragging) return;
    isDragging = false;
    container.style.cursor = '';
    
    var diff = startX - e.pageX;
    if (Math.abs(diff) > dragThreshold) {
      if (diff > 0) {
        // Dragged left = go right
        scrollToSection(currentSection + 1);
      } else {
        // Dragged right = go left
        scrollToSection(currentSection - 1);
      }
    }
  });
  
  // TOUCH SUPPORT - snap based on swipe direction (horizontal only)
  var touchStartX = 0;
  var touchStartY = 0;
  var touchStartScrollTop = 0;
  var touchScrollableEl = null;
  
  container.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].pageX;
    touchStartY = e.touches[0].pageY;
    
    // Check if starting touch inside scrollable content
    var scrollCheck = canScrollVertically(e.target);
    touchScrollableEl = scrollCheck.canScroll ? scrollCheck.element : null;
    touchStartScrollTop = touchScrollableEl ? touchScrollableEl.scrollTop : 0;
  }, { passive: true });
  
  container.addEventListener('touchend', function(e) {
    var touchEndX = e.changedTouches[0].pageX;
    var touchEndY = e.changedTouches[0].pageY;
    var diffX = touchStartX - touchEndX;
    var diffY = touchStartY - touchEndY;
    
    // Only trigger horizontal snap if horizontal swipe is dominant
    // and vertical scroll didn't happen
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > dragThreshold) {
      if (diffX > 0) {
        scrollToSection(currentSection + 1);
      } else {
        scrollToSection(currentSection - 1);
      }
    }
    
    touchScrollableEl = null;
  });
  
  // NAV LINKS
  var navLinks = document.querySelectorAll('.nav-link');
  var dots = document.querySelectorAll('.dot');
  
  navLinks.forEach(function(link, index) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      scrollToSection(index);
    });
  });
  
  dots.forEach(function(dot, index) {
    dot.addEventListener('click', function() {
      scrollToSection(index);
    });
  });
  
  // UPDATE ACTIVE NAV
  container.addEventListener('scroll', function() {
    var scrollLeft = container.scrollLeft;
    var newIndex = Math.round(scrollLeft / window.innerWidth);
    
    // Sync currentSection with actual scroll position
    if (!isScrolling) {
      currentSection = newIndex;
    }
    
    navLinks.forEach(function(link, i) {
      link.classList.toggle('active', i === newIndex);
    });
    
    dots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === newIndex);
    });
  });
  
  // COLLAPSIBLE CATEGORIES
  var categoryGroups = document.querySelectorAll('.category-group');
  
  categoryGroups.forEach(function(group) {
    var header = group.querySelector('.category-header');
    if (header) {
      header.addEventListener('click', function() {
        // Close others
        categoryGroups.forEach(function(g) {
          if (g !== group) g.classList.remove('open');
        });
        // Toggle this one
        group.classList.toggle('open');
      });
    }
  });
  
  // EXPANDABLE TIMELINE ITEMS
  var timelineItems = document.querySelectorAll('.timeline-item.expandable');
  timelineItems.forEach(function(item) {
    var header = item.querySelector('.timeline-header');
    
    if (header) {
      header.addEventListener('click', function(e) {
        item.classList.toggle('expanded');
      });
    }
  });
  
  // MODAL
  var modal = document.getElementById('projectModal');
  var modalBody = document.getElementById('modalBody');
  var closeBtn = document.querySelector('.modal-close');
  var backdrop = document.querySelector('.modal-backdrop');
  
  function closeModal() {
    document.body.classList.remove('modal-open');
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.body.classList.contains('modal-open')) {
      closeModal();
    }
  });
  
  // Modal triggers
  var modalTriggers = document.querySelectorAll('[data-modal]');
  
  modalTriggers.forEach(function(trigger) {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      var modalType = trigger.getAttribute('data-modal');
      var title = trigger.getAttribute('data-title') || 'Project';
      var content = trigger.getAttribute('data-content') || '';
      var images = trigger.getAttribute('data-images') || '';
      var embedPaper = trigger.getAttribute('data-embed-paper') || '';
      var embedSlides = trigger.getAttribute('data-embed-slides') || '';
      
      var html = '<h3>' + title + '</h3>';
      
      // If it's an embed type, show iframes
      if (modalType === 'embed') {
        if (embedSlides) {
          html += '<div class="modal-embed">';
          html += '<div class="modal-embed-label">Presentation</div>';
          html += '<iframe src="' + embedSlides + '" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>';
          html += '</div>';
        }
        
        if (embedPaper) {
          html += '<div class="modal-embed">';
          html += '<div class="modal-embed-label">Research Paper</div>';
          html += '<iframe src="' + embedPaper + '"></iframe>';
          html += '</div>';
        }
        
        if (content) {
          html += '<div class="modal-text">' + content + '</div>';
        }
      } 
      // Otherwise show slideshow if images provided
      else if (images) {
        var imgArray = images.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
        if (imgArray.length > 0) {
          html += '<div class="modal-slideshow">';
          html += '<div class="slideshow-container">';
          imgArray.forEach(function(img, i) {
            html += '<div class="slide ' + (i === 0 ? 'active' : '') + '" data-index="' + i + '">';
            html += '<img src="' + img + '" alt="' + title + '">';
            html += '</div>';
          });
          html += '</div>';
          
          if (imgArray.length > 1) {
            html += '<div class="slideshow-nav">';
            html += '<button class="slide-prev" type="button">←</button>';
            html += '<span class="slide-counter">1 / ' + imgArray.length + '</span>';
            html += '<button class="slide-next" type="button">→</button>';
            html += '</div>';
          }
          html += '</div>';
        }
        
        if (content) {
          html += '<div class="modal-text">' + content + '</div>';
        }
      } else if (content) {
        html += '<div class="modal-text">' + content + '</div>';
      }
      
      modalBody.innerHTML = html;
      document.body.classList.add('modal-open');
      
      // Slideshow controls
      var slides = document.querySelectorAll('.slide');
      var counter = document.querySelector('.slide-counter');
      var prevBtn = document.querySelector('.slide-prev');
      var nextBtn = document.querySelector('.slide-next');
      
      if (slides.length > 1) {
        var current = 0;
        
        function showSlide(index) {
          if (index < 0) index = slides.length - 1;
          if (index >= slides.length) index = 0;
          current = index;
          
          slides.forEach(function(s, i) {
            s.classList.toggle('active', i === current);
          });
          
          if (counter) {
            counter.textContent = (current + 1) + ' / ' + slides.length;
          }
        }
        
        if (prevBtn) {
          prevBtn.addEventListener('click', function() { showSlide(current - 1); });
        }
        if (nextBtn) {
          nextBtn.addEventListener('click', function() { showSlide(current + 1); });
        }
      }
    });
  });
  
  console.log('Portfolio initialized!');
});
