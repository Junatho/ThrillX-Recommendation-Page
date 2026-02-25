// index.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { getFilteredRecommendations } from "./recom.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const activityData = "activities";
const logs = "user_logs"; // public

// === STATES ===
const selectedPreferences = new Set();
let currentRecs = []; // Store current recommendations for sorting

// === DOM ===
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".pref-card").forEach((card) => {
    card.addEventListener("click", () => {
      togglePreference(card);
    });
  });

  const submitBtn = document.getElementById("submit-preferences");
  if (submitBtn) {
      submitBtn.addEventListener("click", handleSubmit);
  }

  const closeModalBtn = document.getElementById("closeModalBtn");
  const modal = document.getElementById("activityModal");
  
  if (closeModalBtn && modal) {
      // To close modal and reset scroll
      closeModalBtn.addEventListener("click", closeModal);
      
      // Close when clicking outside the modal
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
      });
  }

  ScrollToTop();

  const scrollDownBtn = document.getElementById("scrollDownBtn");
  const prefSection = document.getElementById("preference-form");
  
  if (scrollDownBtn && prefSection) {
      scrollDownBtn.addEventListener("click", () => {
          prefSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
  }

  const helpBtn = document.getElementById("helpBtn");
  if (helpBtn) {
      helpBtn.addEventListener("click", openHelpModal);
  }

  const hasVisited = localStorage.getItem("firstLoad");
  if (!hasVisited) {
      setTimeout(() => {
          openHelpModal();
          localStorage.setItem("firstLoad", "true");
      }, 1500); // 1.5 second delay
  }
});

function openHelpModal() {
    const modal = document.getElementById("activityModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle"); 
    const modalContent = document.getElementById("modalContent");
    
    const closeBtn = document.getElementById("closeModalBtn");
    if (closeBtn) {
        closeBtn.parentElement.style.display = 'block'; 
    }

    // Clear subtitle
    if (modalSubtitle) {
        modalSubtitle.innerHTML = ""; 
    }

    modalTitle.textContent = "HELP / INFORMATION";
    modalContent.innerHTML = `
    
        <div class="space-y-6">
            <div class="bg-red-50 p-6 rounded-xl border border-red-100">
                <h2 class="text-lg lg:text-xl md:text-xl lg:text-xl font-bold text-[#9A040F] text-center mb-2 flex items-center">WELCOME TO THRILLX!</h2>
                <p class="leading-relaxed text-black text-justify">
                    Hello! My name is Juan Nathanael Hermanto, I am a final-year Informatics student from Universitas Pelita Harapan. 
                    I am currently conducting research for my final project (thesis), focusing on designing, developing, and implementing a content-based recommendation system 
                    that can use user preferences to provide personalized recommendations for extreme sport and attraction activities in Indonesia.
                </p>
            </div>
            <div>
                <h4 class="font-bold mb-1">About This Project</h4>
                <p class="mb-4 text-justify">
                    As a brief explanation, <a href="http://project-alpha-6c73b.web.app/" target="_blank" class="hover:underline text-[#9A040F]">THRILLX</a> was originally developed by my team as a booking platform for extreme sports and attractions in Indonesia. 
                    This specific version serves as a medium to <strong>demonstrate and test</strong> the performance of my recommendation system.
                </p>
                <p class="bg-gray-50 p-3 rounded-lg border-l-4 border-[#9A040F] text-sm text-justify">
                    This recommendation system is built using a combination of Selenium web-scraping 
                    (using real-world data from <a href="https://www.getyourguide.com" target="_blank" class="hover:underline text-[#ff6040]">GetYourGuide</a>), 
                    Named Entity Recognition (NER), TF-IDF, and Cosine Similarity. This website is built using HTML, Tailwind CSS, and JavaScript.
                </p>
            </div>

            <div>
                <h4 class="font-bold mb-3">How You Can Help</h4>
                <p class="mb-3 text-justify">
                    This interactive website allows you to select your unique preferences that are based on your interests. 
                    For example, if you like to hike mountains then you could choose "Hiking" and "Mountain". 
                    By submitting your preference data, the system will take those preferences and then display multiple recommended activities for you. 
                    You can also use the "Sort By" button to sort the activities based on its price and rating. 
                    By default, the top most activities that you encounter are the top or best matches based on your preferences. By using this website, you are helping me evaluate the performance and accuracy of the system. 
                </p>

                <h4 class="font-bold mb-1">Data Privacy</h4>
                <p class="mb-3 text-justify">
                    No personal data will be saved. This website only logs specific data for research purposes such as:
                </p>
                <ul class="list-disc list-inside bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                    <li>User preferences (inputs)</li>
                    <li>Timestamps (interaction time)</li>
                    <li>Unique recommendation results</li>
                    <li>Performance metrics</li>
                </ul>
                <p class="mt-2 mb-3 text-justify">
                    Upon refreshing this page, the preference form will reset to its default empty state.
                </p>
            </div>

            <div class="pt-4 border-t border-gray-200">
                <p class="mb-4 font-medium text-justify">
                    Because this website is a part of my thesis, I would greatly appreciate it if you took the time to test the features and participate as a respondent for my survey
                    <a href="https://forms.gle/oN4oaEdWVhZ4KY7w9" target="_blank" class="underline text-[#2596be]">here</a>.
                </p>
            </div>

            <div class="pt-2 text-center sm:text-left">
                <p class="font-bold mb-2 text-justify">If you have any questions, please feel free to contact me:</p>
                <div class="flex flex-col sm:flex-row gap-4 text-sm">
                    <div class="flex items-center text-gray-600">
                        <i class="fab fa-whatsapp text-green-500 text-lg mr-2"></i> 
                        <a href="https://wa.me/6208158862039" target="_blank" class=" hover:underline text-[#25d366]">+62 0815-8862-039</a>
                    </div>
                    <div class="flex items-center text-gray-600">
                        <i class="far fa-envelope text-blue-500 text-lg mr-2"></i> 
                        <a href="mailto:01082220019@student.uph.edu" target="_blank" class=" hover:underline text-[#249ee4]">01082220019@student.uph.edu</a>
                    </div>
                </div>
                <p class="mt-8 font-bold text-lg lg:text-xl md:text-xl lg:text-2xl font-bold text-[#9A040F] text-center">Thank you for your time and support!</p>
            </div>
        </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");

    requestAnimationFrame(() => {
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    });

    setTimeout(() => {
        const closeBtn = document.getElementById("helpCloseBtn");
        if(closeBtn) {
            closeBtn.addEventListener("click", closeModal);
        }
    }, 50);
}

export function ScrollToTop() {
  const scrollToTopButton = document.getElementById("scrollToTopButton");
  if (!scrollToTopButton) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollToTopButton.classList.remove("hidden", "opacity-0");
      scrollToTopButton.classList.add("opacity-100");
    } else {
      scrollToTopButton.classList.remove("opacity-100");
      scrollToTopButton.classList.add("opacity-0");
      setTimeout(() => {
        if (window.scrollY <= 100) {
          scrollToTopButton.classList.add("hidden");
        }
      }, 300);
    }
  });

  scrollToTopButton.addEventListener("click", () => {
    const prefSection = document.getElementById("preference-form");
    if (prefSection) {
        prefSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

// Toggle preference button state
function togglePreference(card) {
    const category = card.dataset.category;
    if (!category) return;

    if (selectedPreferences.has(category)) {
        selectedPreferences.delete(category);
        card.classList.remove("bg-[#9A040F]", "text-white", "scale-105", "hover:bg-[#b70a18]", "border-[#9A040F]");
        card.classList.add("bg-gray-50", "text-black", "hover:bg-gray-200", "border-gray-200");
    } else {
        selectedPreferences.add(category);
        card.classList.remove("bg-gray-50", "text-black", "hover:bg-gray-200", "border-gray-200");
        card.classList.add("bg-[#9A040F]", "text-white", "scale-105", "hover:bg-[#b70a18]", "border-[#9A040F]");
    }
}

// Submit handler
async function handleSubmit() {
  if (selectedPreferences.size === 0) {
    alert("Please select at least one preference.");
    return;
  }

  // Raw strings --> ["river,waterfall", "jet ski", "atv"]
  const userPreference = Array.from(selectedPreferences);
  
  // Split activities by comma into a single cleaned list --> ["river", "waterfall", "atv"]
  const selectedPreference = [...new Set(
      userPreference.flatMap(s => s.split(',').map(keyword => keyword.trim()))
  )];

  const outputSection = document.getElementById("selected-output");
  const resultsList = document.getElementById("results-list");
  const loading = document.getElementById("loading");
  
  outputSection.classList.remove("hidden");

  resultsList.innerHTML = "";
  const existingFilter = document.getElementById("results-filter-bar");
  if (existingFilter) existingFilter.remove();

  loading.classList.remove("hidden");

  outputSection.scrollIntoView({ behavior: "smooth", block: "start" });

  await generateRecommendations(selectedPreference);
}

// ---------------- Recommendation ----------------
export async function generateRecommendations(preferences) {
  let activitiesSnapshot;
  try {
    activitiesSnapshot = await getDocs(collection(db, activityData));
  } catch (err) {
    console.error("Firestore Error:", err);
    renderNoResults("Failed to fetch activities.");
    return;
  }

  const activities = activitiesSnapshot.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      Judul: d.Judul || d.title || "Untitled",
      Rating: d.Rating || "N/A",
      Provider: d.Provider || "",
      Harga: d.Harga || "Price on Request",
      FilterHarga: d.FilterHarga ? Number(d.FilterHarga) : 0,
      Highlights: d.Highlights || "",
      FullDescription: d.FullDescription || "",
      Keywords: (d.Keywords || "").toString(),
      
      // Details
      Includes: d.Includes || "",
      Excludes: d.Excludes || "",
      NotSuitableFor: d.NotSuitableFor || "",
      MeetingPoint: d.MeetingPoint || "",
      ImportantInfo: d.GoodToKnow || "",
      
      // Images
      Images: [d.Foto1, d.Foto2, d.Foto3, d.Foto4].filter(url => url && url.trim() !== ""), 
      
      URLorigin: d.URLorigin || ""
    };
  });

  if (activities.length === 0) {
    renderNoResults("No activities found in database.");
    return;
  }

  // Pass to recom.js
  const { recommendations, metrics } = getFilteredRecommendations(preferences, activities);

  // Update state & save data to Firestore (logs)
  currentRecs = recommendations; // Save globally
  const processedQuery = preferences.join(" ");
  
  await saveLogToFirestore(processedQuery, preferences, recommendations, metrics);

    if (recommendations.length > 0) {
        renderSortBy();
        sortBy('top_match'); 
    } else {
        renderRecommendations(recommendations);
    }
}

// ---------------- Sorting ----------------

function sortBy(sortType) {
    const sorted = [...currentRecs];

    if (sortType === "default") {
        // "Top Matches" --> Sort by keyword count (desc) first, then similarity score (desc)
        sorted.sort((a, b) => {
            const countA = (a.matched_keywords || []).length;
            const countB = (b.matched_keywords || []).length;
            
            if (countB !== countA) {
                return countB - countA; // More matches = higher rank
            }
            return (b.similarity || 0) - (a.similarity || 0);
        });
    } else if (sortType === "price-highest") {
        sorted.sort((a, b) => b.FilterHarga - a.FilterHarga);
    } else if (sortType === "price-lowest") {
        sorted.sort((a, b) => a.FilterHarga - b.FilterHarga);
    } else if (sortType === "rating-highest") {
        sorted.sort((a, b) => {
            const valA = parseFloat(a.Rating) || 0;
            const valB = parseFloat(b.Rating) || 0;
            return valB - valA;
        });
    } else if (sortType === "rating-lowest") {
        sorted.sort((a, b) => {
            const valA = parseFloat(a.Rating) || 0;
            const valB = parseFloat(b.Rating) || 0;
            return valA - valB;
        });
    }

    renderRecommendations(sorted);
}

function renderSortBy() {
    const resultsList = document.getElementById("results-list");
    const container = resultsList.parentElement; 
    
    const existingFilter = document.getElementById("results-filter-bar");
    if (existingFilter) existingFilter.remove();

    const filterBar = document.createElement("div");
    filterBar.id = "results-filter-bar";
    // Kept relative positioning
    filterBar.className = "w-full flex justify-between items-center px-2 relative z-20 h-12 mb-2"; 
    
    // Get the current activities count
    const count = currentRecs.length;

    filterBar.innerHTML = `
        <div class="absolute mt-6 left-4 sm:left-4 top-1/2 -translate-y-1/2 text-gray-800 font-roboto-mono text-sm sm:text-md md:text-md lg:text-lg xl:text-xl 2xl:ml-32 font-bold font-large">
            Found <span>${count}</span> activities
        </div>

        <div class="absolute right-0 sm:right-4 pb-4 text-left top-0">
            <div>
                <button id="dropdownButton" type="button" class="inline-flex justify-between items-center w-auto mr-4 md:mr-0 lg:mr-0 xl:mr-0 2xl:mr-32 rounded-lg bg-white text-black border border-black font-roboto-mono py-1.5 px-3 sm:py-2 sm:px-5 text-sm sm:text-base hover:bg-gray-200 transition-colors">
                    <span id="btnText">Sort By</span>
                    <i class="fas fa-sliders ml-3 sm:ml-4"></i>
                </button>
            </div>
            <div id="dropdownMenu" class="hidden origin-top-right absolute right-0 mt-2 mr-4 sm:mr-0 2xl:mr-32 w-40 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <a href="#" class="block px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-[#912F36] hover:text-white first:rounded-t-xl transition-colors" role="menuitem" data-value="top_match">Top Matches</a>
                    <a href="#" class="block px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-[#912F36] hover:text-white transition-colors" role="menuitem" data-value="price-highest">Highest Price</a>
                    <a href="#" class="block px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-[#912F36] hover:text-white transition-colors" role="menuitem" data-value="price-lowest">Lowest Price</a>
                    <a href="#" class="block px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-[#912F36] hover:text-white transition-colors" role="menuitem" data-value="rating-highest">Highest Rating</a>
                    <a href="#" class="block px-4 py-2 text-sm sm:text-base text-gray-700 hover:bg-[#912F36] hover:text-white last:rounded-b-xl transition-colors" role="menuitem" data-value="rating-lowest">Lowest Rating</a>
                </div>
            </div>
        </div>
    `;

    container.insertBefore(filterBar, resultsList);
    
    // --- Sort By's Dropdown ---
    const btn = document.getElementById("dropdownButton");
    const menu = document.getElementById("dropdownMenu");
    const btnText = document.getElementById("btnText");
    const items = menu.querySelectorAll("a");

    btn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent click
        menu.classList.toggle("hidden");
    });

    items.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent # jump
            const value = item.dataset.value;
            const text = item.textContent;

            // Update Sorting
            sortBy(value);

            btnText.textContent = text; 

            menu.classList.add("hidden");
        });
    });

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        if (!menu.classList.contains("hidden") && !btn.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.add("hidden");
        }
    });
}

// ---------------- Rendering ----------------

function renderRecommendations(recs) {
  const container = document.getElementById("results-list");
  const loading = document.getElementById("loading");

  if (loading) loading.classList.add("hidden");
  container.innerHTML = "";

  if (!recs || recs.length === 0) {
    renderNoResults("No matches found. Try broader preferences.");
    return;
  }

  recs.forEach((r, index) => {
    const cardId = `card-${index}`;
    const initialImage = r.Images.length > 0 ? r.Images[0] : "icons/landing.png";
    
    const card = document.createElement('article');
    card.className = "bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-100 group h-full relative";
    
    card.innerHTML = `
      <div class="image-container relative h-60 aspect-[3/4] overflow-hidden bg-gray-100 shrink-0 group">
        <img id="img-${cardId}" src="${escapeHtml(initialImage)}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="${escapeHtml(r.Judul)}"/>
        
        ${r.Images.length > 1 ? `
            <button class="prev-btn absolute left-3 top-1/2 -translate-y-1/2 bg-[#9A040F]/90 hover:bg-[#b70a18] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 transform hover:scale-110">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="next-btn absolute right-3 top-1/2 -translate-y-1/2 bg-[#9A040F]/90 hover:bg-[#b70a18] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 transform hover:scale-110">
                <i class="fas fa-chevron-right"></i>
            </button>
            
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
                ${r.Images.map((_, i) => `
                    <div class="w-2 h-2 rounded-full shadow-sm transition-all duration-300 ${i === 0 ? 'bg-white scale-110' : 'bg-white/50 scale-90'}" 
                         id="dot-${cardId}-${i}">
                    </div>
                `).join('')}
            </div>
        ` : ""}
      </div>

      <div class="p-5 flex flex-col flex-grow">
        <div>
          <h3 class="text-lg font-bold text-[#9A040F] leading-tight mb-2">
            ${escapeHtml(r.Judul)}
          </h3>
          
          <div class="flex items-center gap-2 text-sm text-gray-500 mb-3">
             ${r.Rating && r.Rating !== "N/A" ? `<span class="text-yellow-600 font-bold flex items-center"><i class="fas fa-star mr-1"></i> ${escapeHtml(r.Rating)}</span>` : ""}
             ${r.Provider ? `<span class="text-gray-600 text-sm px-2 border-l border-gray-300">${escapeHtml(r.Provider)}</span>` : ""}
          </div>

          <p class="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
            ${escapeHtml(r.Highlights || r.FullDescription)}
          </p>
        </div>

        <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <span class="font-bold text-[#9A040F] text-sm md:text-lg">${escapeHtml(r.Harga)}</span>
            
            <button class="view-details-btn bg-[#9A040F] hover:bg-[#b70a18] text-white text-xs font-bold py-2 px-6 rounded-lg transition-colors shadow-md">
                VIEW DETAILS
            </button>
        </div>
      </div>
    `;

    card.dataset.images = JSON.stringify(r.Images);
    card.dataset.currentImgIndex = 0;

    container.appendChild(card);

    if (r.Images.length > 1) {
            const imageContainer = card.querySelector(".image-container");
            let touchStartX = 0;
            let touchEndX = 0;
            let touchStartY = 0;
            let touchEndY = 0;

            imageContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
            }, { passive: true });

            imageContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                touchEndY = e.changedTouches[0].screenY;
                handleSwipe();
            }, { passive: true });

            function handleSwipe() {
                const xDiff = touchStartX - touchEndX;
                const yDiff = touchStartY - touchEndY;

                // Swipe threshold: 50px
                if (Math.abs(xDiff) > Math.abs(yDiff) && Math.abs(xDiff) > 50) {
                    if (xDiff > 0) {
                        // Swiped Left -> Next
                        cycleImage(card, 1, cardId);
                    } else {
                        // Swiped Right -> Prev
                        cycleImage(card, -1, cardId);
                    }
                }
            }
        }

        const prevBtn = card.querySelector(".prev-btn");
        const nextBtn = card.querySelector(".next-btn");
        
        if (prevBtn) {
            prevBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                cycleImage(card, -1, cardId);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                cycleImage(card, 1, cardId);
            });
        }

        const btn = card.querySelector(".view-details-btn");
        btn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            openActivityModal(r);
        });
    });
    }

// ---------------- Modal ----------------

function formattedText(text) {
    if (!text) return "";
    const temp = text.replace(/(\.,|,\s*,|\n)/g, "|||");
    const segments = temp.split("|||");
    const cleanSegments = segments.map(segment => {
        let s = segment.trim();
        s = s.replace(/^[,\.\s]+/, ""); 
        return s;
    }).filter(s => s.length > 0); 
    return cleanSegments.join("<br><br>");
}

function bulletTextFormat(text) {
    if (!text) return "";
    const temp = text.replace(/(\.,|,\s*,|\n)/g, "|||");
    const items = temp.split("|||");
    const cleanItems = items.map(item => {
        let s = item.trim();
        s = s.replace(/^[,\.\s]+/, ""); 
        return s;
    }).filter(s => s.length > 0);

    if (cleanItems.length === 0) return "";

    return `<ul class="list-disc pl-5 space-y-1 text-gray-700 text-sm sm:text-md md:text-md leading-relaxed">
        ${cleanItems.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
    </ul>`;
}

function cycleImage(cardImg, direction, cardId) {
    const imgEl = cardImg.querySelector("img"); 
    const images = JSON.parse(cardImg.dataset.images);
    let idx = parseInt(cardImg.dataset.currentImgIndex);
    
    idx += direction;
    if (idx < 0) idx = images.length - 1;
    if (idx >= images.length) idx = 0;
    
    // Update Image
    cardImg.dataset.currentImgIndex = idx;
    imgEl.src = images[idx];

    // Update Dots
    const dots = cardImg.querySelectorAll(`[id^="dot-${cardId}-"]`);
    
    dots.forEach((dot, i) => {
        if (i === idx) {
            // Active Dot
            dot.className = "w-2 h-2 rounded-full shadow-sm transition-all duration-300 bg-white scale-110";
        } else {
            // Inactive Dot
            dot.className = "w-2 h-2 rounded-full shadow-sm transition-all duration-300 bg-white/50 scale-90";
        }
    });
}

function openActivityModal(activity) {
    const modal = document.getElementById("activityModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const modalContent = document.getElementById("modalContent");
    
    const closeBtn = document.getElementById("closeModalBtn");
    if (closeBtn) {
        closeBtn.parentElement.style.display = 'block'; 
        closeBtn.textContent = "Close";
    }

    modalTitle.textContent = activity.Judul;
    modalSubtitle.innerHTML = `
        ${activity.Rating !== "N/A" ? `<span class="text-yellow-600 font-bold font-roboto"><i class="fas fa-star"></i> ${escapeHtml(activity.Rating)}</span>` : ""}
        <span class="text-gray-600">|</span>
        <span class="font-roboto">${escapeHtml(activity.Provider)}</span>
    `;

    // Meeting Point
    let meetingText = "Not Specified";
    let meetingMapLink = "";
    let showMapPreview = false;
    
    if (activity.MeetingPoint && activity.MeetingPoint !== "N/A") {
        if (activity.MeetingPoint.includes("|")) {
            const parts = activity.MeetingPoint.split("|");
            meetingText = parts[0].trim();
            const potentialLink = parts[1].trim();
            if (potentialLink.includes("maps.google") || potentialLink.includes("goo.gl")) {
                meetingMapLink = potentialLink;
                showMapPreview = true;
            }
        } else {
            meetingText = activity.MeetingPoint;
            if(meetingText.length > 3) showMapPreview = true;
        }
    }

    // Grids for include and exclude
    const useGrid = activity.Includes && activity.Excludes;
    const gridClass = useGrid ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6";

    modalContent.innerHTML = `
        ${activity.Highlights ? `
        <div>
            <h3 class="text-lg font-bold text-gray-800 pb-2 mb-1">Highlights</h3>
            <div class="text-gray-700 text-sm sm:text-md md:text-md bg-gray-50 p-4 rounded-lg border-l-4 border-[#9A040F]">
                ${formattedText(escapeHtml(activity.Highlights))}
            </div>
        </div>` : ""}

        <div>
            <h3 class="text-lg font-bold text-gray-800 pb-2 mb-1">Description</h3>
            <div class="text-gray-700 text-sm sm:text-base leading-relaxed text-justify">
                ${formattedText(escapeHtml(activity.FullDescription))}
            </div>
        </div>

        <div class="bg-gray-100 p-3 sm:p-4 rounded-lg border border-gray-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 shadow-sm">
            <div class="flex-1 min-w-0">
                <p class="text-xs text-red-800 font-bold uppercase font-roboto-mono tracking-wider mb-1 sm:mb-0">STARTING FROM</p>
                <p class="text-xl sm:text-2xl font-bold text-[#9A040F] leading-none">${escapeHtml(activity.Harga)}</p>
                <p class="text-[10px] sm:text-xs text-gray-500 italic mt-1 font-roboto">
                    *All activity data was retrieved from 
                    <a href="https://www.getyourguide.com" target="_blank" class="underline hover:text-gray-600">GetYourGuide</a> 
                    on Sept 11, 2025. Prices and other information are subject to change over time.
                </p>
            </div>
            ${activity.URLorigin ? 
                `<a href="${escapeHtml(activity.URLorigin)}" target="_blank" class="w-full sm:w-auto whitespace-nowrap flex-shrink-0 text-center bg-[#9A040F] hover:bg-[#b70a18] text-white font-bold py-2 sm:py-3 px-6 rounded-lg shadow-md transition transform hover:-translate-y-0.5 text-xs sm:text-sm">
                    VISIT SITE <i class="fas fa-external-link-alt ml-2"></i>
                </a>` : ""}
        </div>

        <div class="${gridClass}">
            ${activity.Includes ? `
            <div class="bg-green-50 p-4 rounded-lg border border-green-200 w-full">
                <h4 class="font-bold text-green-800 text-sm sm:text-md md:text-md mb-2 flex items-center"><i class="fas fa-check-circle mr-2"></i>Includes</h4>
                ${bulletTextFormat(activity.Includes)}
            </div>` : ""}
            
            ${activity.Excludes ? `
            <div class="bg-red-50 p-4 rounded-lg border border-red-200 w-full">
                <h4 class="font-bold text-red-800 text-sm sm:text-md md:text-md mb-2 flex items-center"><i class="fas fa-times-circle mr-2"></i>Excludes</h4>
                ${bulletTextFormat(activity.Excludes)}
            </div>` : ""}
        </div>

        <div class="space-y-4">
            ${activity.MeetingPoint && activity.MeetingPoint !== "N/A" ? `
            <div class="border-t border-gray-200 pt-4">
                <h3 class="text-lg font-bold text-gray-800 mb-2">Meeting Point</h3>
                <p class="text-gray-700 text-sm sm:text-md md:text-md mb-3 font-medium">
                    ${escapeHtml(meetingText)}
                </p>
                
                ${showMapPreview ? `
                <div class="w-full h-52 bg-gray-100 rounded-lg overflow-hidden mb-3 border border-gray-200 shadow-inner">
                    <iframe
                        width="100%"
                        height="100%"
                        frameborder="0"
                        style="border:0"
                        loading="lazy"
                        allowfullscreen
                        src="https://maps.google.com/maps?q=${encodeURIComponent(meetingText + " " + activity.Judul)}&t=&z=13&ie=UTF8&iwloc=&output=embed">
                    </iframe>
                </div>` : ""}

                ${meetingMapLink ? `
                <div>
                    <a href="${escapeHtml(meetingMapLink)}" target="_blank" class="inline-flex items-center text-red-600 hover:text-red-800 hover:underline font-bold transition-colors">
                        <i class="fas fa-map-marker-alt mr-2"></i> Open in Google Maps
                    </a>
                </div>` : ""}
            </div>` : ""}

            ${activity.ImportantInfo ? `
            <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h3 class="text-sm sm:text-md md:text-md font-bold text-yellow-800 mb-1 flex items-center"><i class="fas fa-info-circle mr-2"></i>Important Information</h3>
                <div class="text-sm font-bold text-gray-700 pt-2 font-roboto">${formattedText(escapeHtml(activity.ImportantInfo))}</div>
            </div>` : ""}
        </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");

    requestAnimationFrame(() => {
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    });
}

// ---------------- Helpers ----------------

async function saveLogToFirestore(query, preferences, fullResults, metrics) {
  try {
    const payload = {
      timestamp: new Date(),
      query: query,
      preferences: preferences,
      metrics: metrics,
      results: fullResults.map(r => ({
        id: r.id,
        title: r.Judul,
        similarity_score: r.similarity || 0,
        found_keywords: r.matched_keywords || [],
      })),
    };

    await addDoc(collection(db, logs), payload);
  } catch (err) {
    console.warn("Failed to save log:", err);
  }
}

function closeModal() {
    const modal = document.getElementById("activityModal");
    const modalContent = document.getElementById("modalContent");
    
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.classList.remove("overflow-hidden"); 
    
}

function escapeHtml(unsafe) {
  if (unsafe === null || unsafe === undefined) return "";
  return String(unsafe)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}