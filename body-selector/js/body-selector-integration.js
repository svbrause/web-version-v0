/**
 * Body Selector Integration for test7
 * Embedded body selector directly in the concerns selection screen
 */

(function ($) {
  "use strict";

  // Store selections: { area: [concerns] }
  let bodySelectorSelections = {};
  let currentGender = "female";
  let updateSelectionsRef = null;

  // Helper function to count unique backend issues
  function countUniqueBackendIssues() {
    const uniqueIssues = new Set();
    for (let area in bodySelectorSelections) {
      const concerns = bodySelectorSelections[area];
      concerns.forEach((concern) => {
        uniqueIssues.add(concern);
      });
    }
    return uniqueIssues.size;
  }

  // Helper function to check if a concern is already selected
  function isConcernAlreadySelected(concern) {
    for (let area in bodySelectorSelections) {
      if (bodySelectorSelections[area].includes(concern)) {
        return true;
      }
    }
    return false;
  }

  // Map visual area names to backend area names
  const areaMapping = {
    Forehead: "Forehead",
    Eyes: "Eyes",
    Cheeks: "Cheeks",
    Nose: "Nose",
    Mouth: "Lips",
    Jaw: "Chin/Jaw",
    Neck: "Neck",
    Chest: "Body",
    Arms: "Body",
    Abdomen: "Body",
    Flanks: "Body",
    Thighs: "Body",
    Hands: "Body",
    Intimate: "Body",
    "Lower Legs": "Body",
    "Upper Back": "Body",
    "Lower Back": "Body",
    Shoulders: "Body",
    "Back of Arms": "Body",
    "Back of Thighs": "Body",
    "Back of Lower Legs": "Body",
  };

  // Get concerns for an area from backend data
  function getConcernsForArea(area) {
    const backendArea = areaMapping[area] || area;
    const areasAndIssues = window.areasAndIssues || {};
    return areasAndIssues[backendArea] || [];
  }

  // Initialize body selector when DOM is ready
  $(document).ready(function () {
    // Wait for areasAndIssues to be available
    waitForBackendData(function() {
      initializeEmbeddedBodySelector();
    });
  });

  function waitForBackendData(callback) {
    if (window.areasAndIssues && Object.keys(window.areasAndIssues).length > 0) {
      callback();
    } else {
      setTimeout(function() {
        waitForBackendData(callback);
      }, 100);
    }
  }

  function initializeEmbeddedBodySelector() {
    const $container = $("#embedded-body-selector");
    if (!$container.length) return;

    // Inject the body selector HTML
    $container.html(`
      <div class="embedded-selector-wrapper">
        <div class="selector-figure-container">
          <button class="selector-rotate-btn selector-rotate-left" id="rotate-left-btn" title="Rotate to back view">
            <span>↻</span>
          </button>
          
          <div class="selector-figure-wrapper">
            <!-- Body View (Front) -->
            <div class="selector-body-view" id="body-view">
              <img src="body-selector/images/woman%20body.svg" alt="Female figure" class="selector-figure-svg" id="figure-svg" />
            </div>
            
            <!-- Body View (Back) -->
            <div class="selector-body-view" id="body-back-view" style="display: none">
              <img src="body-selector/images/woman%20back.svg" alt="Female figure back" class="selector-figure-svg" id="figure-back-svg" />
            </div>
            
            <!-- Expanded Face View -->
            <div class="selector-face-view" id="face-view" style="display: none">
              <img src="body-selector/images/expanded%20female%20face.svg" alt="Expanded face view" class="selector-face-svg" id="face-svg" />
            </div>
          </div>
          
          <button class="selector-rotate-btn selector-rotate-right" id="rotate-right-btn" title="Rotate to front view">
            <span>↺</span>
          </button>
        </div>
        
        <div class="selector-back-btn-container" id="back-btn-container" style="display: none;">
          <button class="selector-back-btn" id="back-to-body-btn">
            ← Back to Body
          </button>
        </div>
      </div>
      
      <!-- Concern Selection Modal -->
      <div class="selector-modal-overlay" id="concern-modal" style="display: none">
        <div class="selector-modal">
          <div class="selector-modal-header">
            <h3 id="modal-area-name">Select Concerns</h3>
            <button class="selector-modal-close" id="close-modal">×</button>
          </div>
          <div class="selector-modal-body">
            <p class="selector-modal-subtitle">Select the concerns you'd like to address:</p>
            <div class="selector-concerns-list" id="concerns-list"></div>
          </div>
          <div class="selector-modal-footer">
            <button class="selector-btn-secondary" id="cancel-concerns">Cancel</button>
            <button class="selector-btn-primary" id="add-concerns">Add to Plan</button>
          </div>
        </div>
      </div>
    `);

    // Add body part buttons
    addBodyPartButtons();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Load existing selections if any
    loadExistingSelections();
    
    // Update display
    updateSelectionsDisplay();
  }

  function addBodyPartButtons() {
    const $bodyView = $("#body-view");
    const $backView = $("#body-back-view");
    const $faceView = $("#face-view");

    // Front body parts
    const frontBodyParts = [
      { part: "face", area: "Face", top: "8%", left: "50%", expand: true },
      { part: "chest", area: "Chest", top: "22%", left: "28%" },
      { part: "arms", area: "Arms", top: "23%", left: "80%" },
      { part: "abdomen", area: "Abdomen", top: "38%", left: "60%" },
      { part: "flanks", area: "Flanks", top: "32%", left: "30%" },
      { part: "thighs", area: "Thighs", top: "55%", left: "28%" },
      { part: "hands", area: "Hands", top: "53%", left: "92%" },
      { part: "intimate", area: "Intimate", top: "45%", left: "35%" },
      { part: "lower-legs", area: "Lower Legs", top: "78%", left: "60%" },
    ];

    frontBodyParts.forEach(function (partData) {
      const $btn = $(`
        <button class="selector-body-part-btn${partData.expand ? ' selector-face-expand-btn' : ''}" 
                data-part="${partData.part}" 
                data-area="${partData.area}" 
                style="top: ${partData.top}; left: ${partData.left}">
          <span class="btn-plus">${partData.expand ? '⛶' : '+'}</span>
        </button>
      `);
      $bodyView.append($btn);
    });

    // Back body parts
    const backBodyParts = [
      { area: "Upper Back", top: "23%", left: "62%" },
      { area: "Lower Back", top: "35%", left: "40%" },
      { area: "Shoulders", top: "18%", left: "30%" },
      { area: "Back of Arms", top: "32%", left: "90%" },
      { area: "Back of Thighs", top: "57%", left: "32%" },
      { area: "Back of Lower Legs", top: "82%", left: "60%" },
    ];

    backBodyParts.forEach(function (partData) {
      const $btn = $(`
        <button class="selector-body-part-btn" 
                data-area="${partData.area}" 
                style="top: ${partData.top}; left: ${partData.left}">
          <span class="btn-plus">+</span>
        </button>
      `);
      $backView.append($btn);
    });

    // Face areas
    const faceAreas = [
      { area: "Forehead", top: "10%", left: "37%" },
      { area: "Eyes", top: "32%", left: "72%" },
      { area: "Cheeks", top: "40%", left: "15%" },
      { area: "Nose", top: "50%", left: "50%" },
      { area: "Mouth", top: "65%", left: "50%" },
      { area: "Jaw", top: "66%", left: "81%" },
      { area: "Neck", top: "90%", left: "35%" },
    ];

    faceAreas.forEach(function (areaData) {
      const $btn = $(`
        <button class="selector-face-area-btn" 
                data-area="${areaData.area}" 
                style="top: ${areaData.top}; left: ${areaData.left}">
          <span class="btn-plus">+</span>
        </button>
      `);
      $faceView.append($btn);
    });
  }

  function setupEventHandlers() {
    let isFaceView = false;
    let isBackView = false;
    let currentArea = null;

    // Switch gender link
    $(document).on("click", "#switch-gender-link", function (e) {
      e.preventDefault();
      currentGender = currentGender === "female" ? "male" : "female";
      $(this).text(currentGender === "female" ? "Switch to Male" : "Switch to Female");
      updateBodyImages();
    });

    // How to use link
    $(document).on("click", "#how-to-use-link", function (e) {
      e.preventDefault();
      alert("Click on the + buttons on the body to select areas.\nChoose your concerns from the popup.\nSelect up to 3 concerns total.");
    });

    // Body part buttons
    $(document).on("click", ".selector-body-part-btn", function (e) {
      e.stopPropagation();
      const area = $(this).data("area");
      const part = $(this).data("part");

      if (part === "face") {
        showFaceView();
        return;
      }

      currentArea = area;
      showConcernModal(area);
    });

    // Face area buttons
    $(document).on("click", ".selector-face-area-btn", function (e) {
      e.stopPropagation();
      const area = $(this).data("area");
      currentArea = area;
      showConcernModal(area);
    });

    // Rotate buttons
    $(document).on("click", "#rotate-left-btn, #rotate-right-btn", function () {
      if (!isFaceView) {
        if (isBackView) {
          showFrontView();
        } else {
          showBackView();
        }
      }
    });

    // Back to body button
    $(document).on("click", "#back-to-body-btn", function () {
      showBodyView();
    });

    // Modal close handlers
    $(document).on("click", "#close-modal, #cancel-concerns", function () {
      $("#concern-modal").fadeOut(300);
    });

    $(document).on("click", "#concern-modal", function (e) {
      if ($(e.target).hasClass("selector-modal-overlay")) {
        $("#concern-modal").fadeOut(300);
      }
    });

    // Add concerns
    $(document).on("click", "#add-concerns", function () {
      if (!currentArea) return;

      const checked = $("#concerns-list").find('input[type="checkbox"]:checked:not(:disabled)');
      const newConcerns = [];

      checked.each(function () {
        const concern = $(this).next("label").text().replace(/\s*\(.*?\)\s*$/, "");
        if (!isConcernAlreadySelected(concern) || bodySelectorSelections[currentArea]?.includes(concern)) {
          newConcerns.push(concern);
        }
      });

      if (newConcerns.length > 0) {
        bodySelectorSelections[currentArea] = newConcerns;
      } else {
        delete bodySelectorSelections[currentArea];
      }

      updateSelectionsDisplay();
      $("#concern-modal").fadeOut(300);
    });

    // View functions
    function showFaceView() {
      isFaceView = true;
      isBackView = false;
      $("#body-view").fadeOut(300);
      $("#body-back-view").fadeOut(300, function () {
        $("#face-view").fadeIn(300);
        updateBodyImages();
      });
      $("#rotate-left-btn, #rotate-right-btn").hide();
      $("#back-btn-container").show();
    }

    function showBodyView() {
      isFaceView = false;
      isBackView = false;
      $("#face-view").fadeOut(300, function () {
        $("#body-back-view").fadeOut(300);
        $("#body-view").fadeIn(300);
        updateBodyImages();
      });
      $("#rotate-left-btn, #rotate-right-btn").show();
      $("#back-btn-container").hide();
    }

    function showBackView() {
      isBackView = true;
      $("#body-view").fadeOut(300, function () {
        $("#body-back-view").fadeIn(300);
        updateBodyImages();
      });
      $("#rotate-left-btn, #rotate-right-btn").show();
    }

    function showFrontView() {
      isBackView = false;
      $("#body-back-view").fadeOut(300, function () {
        $("#body-view").fadeIn(300);
        updateBodyImages();
      });
      $("#rotate-left-btn, #rotate-right-btn").show();
    }

    function updateBodyImages() {
      if (isFaceView) {
        const faceSrc = currentGender === "female"
          ? "body-selector/images/expanded%20female%20face.svg"
          : "body-selector/images/expanded%20male%20face.svg";
        $("#face-svg").attr("src", faceSrc);
      } else if (isBackView) {
        const backSrc = currentGender === "female"
          ? "body-selector/images/woman%20back.svg"
          : "body-selector/images/man%20back.svg";
        $("#figure-back-svg").attr("src", backSrc);
      } else {
        const bodySrc = currentGender === "female"
          ? "body-selector/images/woman%20body.svg"
          : "body-selector/images/man%20body.svg";
        $("#figure-svg").attr("src", bodySrc);
      }
    }

    function showConcernModal(area) {
      currentArea = area;
      $("#modal-area-name").text(area);
      
      const selectedConcerns = bodySelectorSelections[area] || [];
      const concerns = getConcernsForArea(area);
      const uniqueCount = countUniqueBackendIssues();

      const $concernsList = $("#concerns-list");
      $concernsList.empty();

      concerns.forEach(function (concern) {
        const isSelected = selectedConcerns.includes(concern);
        const isDuplicate = !isSelected && isConcernAlreadySelected(concern);
        const isMaxReached = !isSelected && !isDuplicate && uniqueCount >= 3;

        const $item = $('<div class="selector-concern-item"></div>');
        if (isSelected) $item.addClass("selected");
        if (isDuplicate || isMaxReached) $item.addClass("disabled");

        const checkboxId = "concern-" + concern.replace(/\s+/g, "-").toLowerCase();
        const $checkbox = $(`<input type="checkbox" id="${checkboxId}">`);
        if (isSelected) $checkbox.prop("checked", true);
        if (isDuplicate || isMaxReached) $checkbox.prop("disabled", true);

        let labelText = concern;
        if (isDuplicate) labelText += " (already selected)";
        else if (isMaxReached) labelText += " (max 3 concerns)";

        const $label = $(`<label for="${checkboxId}">${labelText}</label>`);

        $item.append($checkbox).append($label);

        $item.on("click", function (e) {
          if (e.target.type === "checkbox" || isDuplicate || isMaxReached) return;
          e.preventDefault();
          e.stopPropagation();
          const newState = !$checkbox.prop("checked");
          $checkbox.prop("checked", newState);
          $item.toggleClass("selected", newState);
        });

        $checkbox.on("change", function () {
          if (isDuplicate || isMaxReached) {
            $(this).prop("checked", false);
            return;
          }
          $item.toggleClass("selected", $(this).prop("checked"));
        });

        $concernsList.append($item);
      });

      $("#concern-modal").fadeIn(300);
    }
  }

  function loadExistingSelections() {
    if (window.userSelections && 
        window.userSelections.selectedIssues && 
        window.userSelections.selectedIssues.length > 0) {
      const areas = window.userSelections.selectedAreas || [];
      const issues = window.userSelections.selectedIssues || [];
      
      // Convert to body selector format
      bodySelectorSelections = {};
      areas.forEach((area, index) => {
        if (area && issues[index]) {
          if (!bodySelectorSelections[area]) {
            bodySelectorSelections[area] = [];
          }
          bodySelectorSelections[area].push(issues[index]);
        }
      });
    }
  }

  function updateSelectionsDisplay() {
    const uniqueCount = countUniqueBackendIssues();
    
    // Update count display
    $("#concerns-count").text(uniqueCount);
    
    // Update selected concerns display
    const $display = $("#selected-concerns-display");
    $display.empty();
    
    if (uniqueCount > 0) {
      $display.show();
      // Gather all selected concerns
      const allConcerns = [];
      for (let area in bodySelectorSelections) {
        bodySelectorSelections[area].forEach(concern => {
          allConcerns.push({ area: area, concern: concern });
        });
      }
      
      // Show chips for selected concerns
      const $chipsContainer = $('<div class="selected-concerns-chips"></div>');
      allConcerns.forEach(item => {
        const $chip = $(`
          <span class="concern-chip">
            <span class="chip-text">${item.concern}</span>
            <button class="chip-remove" data-area="${item.area}" data-concern="${item.concern}">×</button>
          </span>
        `);
        $chipsContainer.append($chip);
      });
      $display.append($chipsContainer);
      
      // Chip remove handler
      $display.find(".chip-remove").on("click", function() {
        const area = $(this).data("area");
        const concern = $(this).data("concern");
        if (bodySelectorSelections[area]) {
          const index = bodySelectorSelections[area].indexOf(concern);
          if (index > -1) {
            bodySelectorSelections[area].splice(index, 1);
            if (bodySelectorSelections[area].length === 0) {
              delete bodySelectorSelections[area];
            }
            updateSelectionsDisplay();
          }
        }
      });
    } else {
      $display.hide();
    }
    
    // Update Continue button state
    const $continueBtn = $("#proceed-to-goals-btn");
    if (uniqueCount === 0) {
      $continueBtn.prop("disabled", true);
    } else {
      $continueBtn.prop("disabled", false);
    }
    
    // Sync to userSelections
    syncToUserSelections();
  }

  function syncToUserSelections() {
    const selectedAreas = [];
    const selectedIssues = [];
    
    for (let area in bodySelectorSelections) {
      const backendArea = areaMapping[area] || area;
      bodySelectorSelections[area].forEach(concern => {
        selectedAreas.push(backendArea);
        selectedIssues.push(concern);
      });
    }
    
    if (!window.userSelections) {
      window.userSelections = {};
    }
    window.userSelections.selectedAreas = selectedAreas;
    window.userSelections.selectedIssues = selectedIssues;
    
    // Update hidden form fields for backward compatibility
    updateHiddenFormFields(selectedAreas, selectedIssues);
  }

  function updateHiddenFormFields(areas, issues) {
    const $container = $("#region-issue-rows");
    if (!$container.length) return;
    
    $container.empty();

    issues.forEach((issue, index) => {
      if (index >= 3) return;

      const row = document.createElement("div");
      row.className = "region-issue-row";
      row.style.display = "none";

      const regionSelect = document.createElement("select");
      regionSelect.className = "region-select";
      if (areas[index]) regionSelect.value = areas[index];

      const issueSelect = document.createElement("select");
      issueSelect.className = "issue-select";
      issueSelect.value = issue;

      row.appendChild(regionSelect);
      row.appendChild(issueSelect);
      $container.append(row);
    });
  }

  // Export for global access
  window.getBodySelectorSelections = function() {
    return bodySelectorSelections;
  };

  window.updateEmbeddedSelectorDisplay = function() {
    updateSelectionsDisplay();
  };

})(jQuery);
