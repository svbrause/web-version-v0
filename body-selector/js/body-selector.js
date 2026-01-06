/**
 * Treatment Builder - Standalone JavaScript
 */

(function ($) {
  "use strict";

  // Concerns data for each body area
  // Gender-specific concerns are marked with [female] or [male]
  const concernsData = {
    Forehead: [
      "11s (Frown Lines)",
      "Furrowed Brow",
      "Horizontal Forehead Lines",
      "Drooping Forehead",
      "Loss of Volume",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Melasma",
      "Large Pores",
      "Acne",
      "Acne Scarring",
    ],
    Eyes: [
      "Crow's Feet",
      "Bags Under Eyes",
      "Puffy Eyes",
      "Dark Circles",
      "Sagging Eyelids",
      "Hooded Eyelids",
      "Drooping Eyelids",
      "Under-Eye Hollows",
      "Fine Lines",
      "Wrinkles",
      "Loss of Volume",
      "Sun Damage",
      "Age Spots",
    ],
    Cheeks: [
      "Undefined Cheekbones",
      "Loss of Volume",
      "Hollow Cheeks",
      "Nasolabial Folds",
      "Marionette Lines",
      "Sagging Skin",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Melasma",
      "Large Pores",
      "Acne",
      "Acne Scarring",
      "Rosacea",
    ],
    Nose: [
      "Large Pores",
      "Blackheads",
      "Whiteheads",
      "Oily Skin",
      "Acne",
      "Acne Scarring",
      "Redness",
      "Rosacea",
      "Broken Capillaries",
      "Sun Damage",
      "Age Spots",
      "Unwanted Hair",
    ],
    Mouth: [
      "Lip Lines",
      "Smoker's Lines",
      "Thin Lips",
      "Loss of Volume",
      "Downturned Corners",
      "Marionette Lines",
      "Fine Lines",
      "Wrinkles",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
    ],
    Jaw: [
      "Jowls",
      "Double Chin",
      "Sagging Skin",
      "Loss of Definition",
      "Excess Fat",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Acne",
      "Acne Scarring",
      "Unwanted Hair",
    ],
    Neck: [
      "Platysmal Bands",
      "Turkey Neck",
      "Sagging Skin",
      "Loose Skin",
      "Wrinkles",
      "Horizontal Neck Lines",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Crepey Skin",
      "Excess Fat",
      "Unwanted Hair",
    ],
    Chest: {
      female: [
        "Flat Breasts",
        "Sagging Breasts",
        "Asymmetric Breasts",
        "Loss of Volume",
        "Stretch Marks",
        "Sun Damage",
        "Age Spots",
        "Hyperpigmentation",
        "Acne",
        "Acne Scarring",
        "Large Pores",
        "Unwanted Hair",
      ],
      male: [
        "Gynecomastia",
        "Puffy Nipples",
        "Excess Fat",
        "Sagging Skin",
        "Sun Damage",
        "Age Spots",
        "Hyperpigmentation",
        "Acne",
        "Acne Scarring",
        "Large Pores",
        "Unwanted Hair",
      ],
    },
    Arms: [
      "Bat Wings",
      "Sagging Skin",
      "Loose Skin",
      "Excess Fat",
      "Stretch Marks",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Acne",
      "Acne Scarring",
      "Unwanted Hair",
    ],
    Abdomen: [
      "Excess Fat",
      "Sagging Skin",
      "Loose Skin",
      "Stretch Marks",
      "C-Section Scarring",
      "Surgical Scarring",
      "Diastasis Recti",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Unwanted Hair",
    ],
    Flanks: [
      "Love Handles",
      "Excess Fat",
      "Sagging Skin",
      "Loose Skin",
      "Stretch Marks",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Unwanted Hair",
    ],
    Thighs: [
      "Cellulite",
      "Excess Fat",
      "Sagging Skin",
      "Loose Skin",
      "Stretch Marks",
      "Inner Thigh Rub",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Unwanted Hair",
    ],
    Hands: [
      "Volume Loss",
      "Prominent Veins",
      "Age Spots",
      "Sun Spots",
      "Wrinkles",
      "Crepey Skin",
      "Thin Skin",
      "Hyperpigmentation",
      "Scarring",
    ],
    Intimate: {
      female: [
        "Labial Hypertrophy",
        "Loss of Volume",
        "Sagging Skin",
        "Loose Skin",
        "Hyperpigmentation",
        "Scarring",
        "Unwanted Hair",
      ],
      male: [
        "Penile Enhancement",
        "Loss of Volume",
        "Sagging Skin",
        "Hyperpigmentation",
        "Scarring",
        "Unwanted Hair",
      ],
    },
    "Lower Legs": [
      "Varicose Veins",
      "Spider Veins",
      "Sagging Skin",
      "Loose Skin",
      "Excess Fat",
      "Stretch Marks",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Scarring",
      "Unwanted Hair",
    ],
    "Upper Back": [
      "Back Acne",
      "Acne Scarring",
      "Hyperpigmentation",
      "Sun Damage",
      "Age Spots",
      "Large Pores",
      "Clogged Pores",
      "Oily Skin",
      "Unwanted Hair",
    ],
    "Lower Back": [
      "Back Acne",
      "Acne Scarring",
      "Hyperpigmentation",
      "Sun Damage",
      "Age Spots",
      "Stretch Marks",
      "Large Pores",
      "Clogged Pores",
      "Oily Skin",
      "Unwanted Hair",
    ],
    Shoulders: [
      "Back Acne",
      "Acne Scarring",
      "Hyperpigmentation",
      "Sun Damage",
      "Age Spots",
      "Large Pores",
      "Clogged Pores",
      "Oily Skin",
      "Unwanted Hair",
    ],
    "Back of Arms": [
      "Sagging Skin",
      "Loose Skin",
      "Excess Fat",
      "Stretch Marks",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Acne",
      "Acne Scarring",
      "Unwanted Hair",
    ],
    "Back of Thighs": [
      "Cellulite",
      "Excess Fat",
      "Sagging Skin",
      "Loose Skin",
      "Stretch Marks",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Unwanted Hair",
    ],
    "Back of Lower Legs": [
      "Varicose Veins",
      "Spider Veins",
      "Sagging Skin",
      "Loose Skin",
      "Excess Fat",
      "Stretch Marks",
      "Sun Damage",
      "Age Spots",
      "Hyperpigmentation",
      "Scarring",
      "Unwanted Hair",
    ],
  };

  $(document).ready(function () {
    const $welcomeScreen = $("#welcome-screen");
    const $builderScreen = $("#builder-screen");
    const $startBtn = $("#start-btn");
    const $switchGenderBtn = $("#switch-gender-btn");
    const $bodyPartBtns = $(".llvc-body-part-btn");
    const $selectionsList = $("#selections-list");
    const $selectionCount = $("#selection-count");
    const $expandedSelectionCount = $("#expanded-selection-count");
    const $selectionsPanel = $("#selections-panel");
    const $expandSelectionsBtn = $("#expand-selections-btn");
    const $expandedSelections = $("#expanded-selections");
    const $expandedSelectionsList = $("#expanded-selections-list");
    const $backFromSelectionsBtn = $("#back-from-selections-btn");
    const $clearAllBtn = $("#clear-all-btn");
    const $selectMoreConcernsBtn = $("#select-more-concerns-btn");
    const $finishConsultationBtn = $("#finish-consultation-btn");
    const $leadCapture = $("#lead-capture");
    const $leadCaptureForm = $("#lead-capture-form");
    const $noSelections = $("#no-selections");
    const $startMessage = $("#start-message");
    const $concernModal = $("#concern-modal");
    const $closeModal = $("#close-modal");
    const $cancelConcerns = $("#cancel-concerns");
    const $addConcerns = $("#add-concerns");
    const $concernsList = $("#concerns-list");
    const $modalAreaName = $("#modal-area-name");
    const $figureSvg = $("#figure-svg");
    const $bodyView = $("#body-view");
    const $bodyBackView = $("#body-back-view");
    const $figureBackSvg = $("#figure-back-svg");
    const $faceView = $("#face-view");
    const $faceSvg = $("#face-svg");
    const $backToBodyBtn = $("#back-to-body-btn");
    const $rotateLeftBtn = $("#rotate-left-btn");
    const $rotateRightBtn = $("#rotate-right-btn");
    let $faceAreaBtns = $(".llvc-face-area-btn");

    let selections = {}; // { area: [concerns] }
    let currentGender = "female";
    let currentArea = null;
    let selectedConcerns = [];
    let isFaceView = false;
    let isBackView = false;

    // Start button click
    $startBtn.on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $welcomeScreen.fadeOut(300, function () {
        $builderScreen.fadeIn(300);
      });
    });

    // Switch gender
    $switchGenderBtn.on("click", function (e) {
      e.preventDefault();
      currentGender = currentGender === "female" ? "male" : "female";
      $(this).text(
        currentGender === "female" ? "Switch to Male" : "Switch to Female"
      );

      // If modal is open, refresh it to show gender-specific concerns
      if ($concernModal.is(":visible") && currentArea) {
        showConcernModal(currentArea);
      }

      // Update SVG images
      if (isFaceView) {
        const faceSrc =
          currentGender === "female"
            ? "expanded%20female%20face.svg"
            : "expanded%20male%20face.svg";
        $faceSvg.attr("src", faceSrc);
        $faceSvg.attr(
          "alt",
          currentGender === "female"
            ? "Expanded female face"
            : "Expanded male face"
        );
      } else if (isBackView) {
        const backSrc =
          currentGender === "female" ? "woman%20back.svg" : "man%20back.svg";
        $figureBackSvg.attr("src", backSrc);
        $figureBackSvg.attr(
          "alt",
          currentGender === "female" ? "Female figure back" : "Male figure back"
        );
      } else {
        const bodySrc =
          currentGender === "female" ? "woman%20body.svg" : "man%20body.svg";
        $figureSvg.attr("src", bodySrc);
        $figureSvg.attr(
          "alt",
          currentGender === "female" ? "Female figure" : "Male figure"
        );
      }
    });

    // Body part button click
    $bodyPartBtns.on("click", function (e) {
      e.stopPropagation();
      const area = $(this).data("area");
      const part = $(this).data("part");

      // Special handling for face - show expanded face view
      if (part === "face") {
        showFaceView();
        return;
      }

      currentArea = area;

      // Remove active class from all buttons
      $bodyPartBtns.removeClass("active");
      // Add active class to clicked button
      $(this).addClass("active");

      // Show modal with concerns
      showConcernModal(area);
    });

    // Face area button click (using event delegation since buttons are in hidden container)
    $(document).on("click", ".llvc-face-area-btn", function (e) {
      e.stopPropagation();
      const area = $(this).data("area");
      currentArea = area;

      // Remove active class from all buttons
      $(".llvc-face-area-btn").removeClass("active");
      // Add active class to clicked button
      $(this).addClass("active");

      // Show modal with concerns
      showConcernModal(area);
    });

    // Back to body button
    $backToBodyBtn.on("click", function () {
      showBodyView();
    });

    // Rotate buttons - both always active and toggle between front/back
    $rotateLeftBtn.on("click", function () {
      if (!isFaceView) {
        // Toggle between front and back views
        if (isBackView) {
          showFrontView();
        } else {
          showBackView();
        }
      }
    });

    $rotateRightBtn.on("click", function () {
      if (!isFaceView) {
        // Toggle between front and back views
        if (isBackView) {
          showFrontView();
        } else {
          showBackView();
        }
      }
    });

    function showFaceView() {
      isFaceView = true;
      isBackView = false;
      $bodyView.fadeOut(300);
      $bodyBackView.fadeOut(300, function () {
        $faceView.fadeIn(300);
        // Update face SVG based on current gender
        const faceSrc =
          currentGender === "female"
            ? "expanded%20female%20face.svg"
            : "expanded%20male%20face.svg";
        $faceSvg.attr("src", faceSrc);
        $faceSvg.attr(
          "alt",
          currentGender === "female"
            ? "Expanded female face"
            : "Expanded male face"
        );
      });
      // Hide rotate buttons when in face view
      $rotateLeftBtn.hide();
      $rotateRightBtn.hide();
      // Show back to body button
      $backToBodyBtn.show();
      // Remove active class from body part buttons
      $bodyPartBtns.removeClass("active");
    }

    function showBodyView() {
      isFaceView = false;
      isBackView = false;
      $faceView.fadeOut(300, function () {
        $bodyBackView.fadeOut(300);
        $bodyView.fadeIn(300);
        // Update body SVG based on current gender
        const bodySrc =
          currentGender === "female" ? "woman%20body.svg" : "man%20body.svg";
        $figureSvg.attr("src", bodySrc);
        $figureSvg.attr(
          "alt",
          currentGender === "female" ? "Female figure" : "Male figure"
        );
      });
      // Remove active class from face area buttons
      $(".llvc-face-area-btn").removeClass("active");
      // Show rotate buttons (both sides)
      $rotateLeftBtn.show();
      $rotateRightBtn.show();
      // Hide back to body button
      $backToBodyBtn.hide();
    }

    function showBackView() {
      isBackView = true;
      $bodyView.fadeOut(300, function () {
        $bodyBackView.fadeIn(300);
        // Update back SVG based on current gender
        const backSrc =
          currentGender === "female" ? "woman%20back.svg" : "man%20back.svg";
        $figureBackSvg.attr("src", backSrc);
        $figureBackSvg.attr(
          "alt",
          currentGender === "female" ? "Female figure back" : "Male figure back"
        );
      });
      // Show rotate buttons (both sides)
      $rotateLeftBtn.show();
      $rotateRightBtn.show();
      // Remove active class from body part buttons
      $bodyPartBtns.removeClass("active");
    }

    function showFrontView() {
      isBackView = false;
      $bodyBackView.fadeOut(300, function () {
        $bodyView.fadeIn(300);
        // Update body SVG based on current gender
        const bodySrc =
          currentGender === "female" ? "woman%20body.svg" : "man%20body.svg";
        $figureSvg.attr("src", bodySrc);
        $figureSvg.attr(
          "alt",
          currentGender === "female" ? "Female figure" : "Male figure"
        );
      });
      // Show rotate buttons (both sides)
      $rotateLeftBtn.show();
      $rotateRightBtn.show();
      // Remove active class from body part buttons
      $bodyPartBtns.removeClass("active");
    }

    function showConcernModal(area) {
      $modalAreaName.text(area);
      selectedConcerns = selections[area] || [];

      // Clear and populate concerns list
      $concernsList.empty();

      if (concernsData[area]) {
        // Check if concerns are gender-specific (object) or general (array)
        let concernsToShow = [];
        if (
          typeof concernsData[area] === "object" &&
          !Array.isArray(concernsData[area])
        ) {
          // Gender-specific concerns
          concernsToShow = concernsData[area][currentGender] || [];
        } else {
          // General concerns (array)
          concernsToShow = concernsData[area];
        }

        concernsToShow.forEach(function (concern) {
          const isSelected = selectedConcerns.includes(concern);
          const $item = $('<div class="llvc-concern-item"></div>');
          if (isSelected) {
            $item.addClass("selected");
          }

          const $checkbox = $(
            '<input type="checkbox" id="concern-' +
              concern.replace(/\s+/g, "-").toLowerCase() +
              '">'
          );
          if (isSelected) {
            $checkbox.prop("checked", true);
          }

          const $label = $(
            '<label for="concern-' +
              concern.replace(/\s+/g, "-").toLowerCase() +
              '">' +
              concern +
              "</label>"
          );

          $item.append($checkbox).append($label);

          // Make entire item clickable - toggle selection on click anywhere
          $item.on("click", function (e) {
            // If clicking directly on checkbox, let it handle its own click
            if (e.target.type === "checkbox") {
              return;
            }

            // For clicks anywhere else on the item, toggle the checkbox
            e.preventDefault();
            e.stopPropagation();

            const newState = !$checkbox.prop("checked");
            $checkbox.prop("checked", newState);
            $item.toggleClass("selected", newState);
          });

          // Update visual state when checkbox changes (handles direct checkbox clicks)
          $checkbox.on("change", function () {
            $item.toggleClass("selected", $(this).prop("checked"));
          });

          $concernsList.append($item);
        });
      }

      $concernModal.fadeIn(300);
    }

    // Close modal
    $closeModal.on("click", closeModal);
    $cancelConcerns.on("click", closeModal);

    // Click outside modal to close
    $concernModal.on("click", function (e) {
      if ($(e.target).hasClass("llvc-modal-overlay")) {
        closeModal();
      }
    });

    function closeModal() {
      $concernModal.fadeOut(300);
      $bodyPartBtns.removeClass("active");
      $(".llvc-face-area-btn").removeClass("active");
    }

    // Add concerns to plan
    $addConcerns.on("click", function () {
      if (!currentArea) return;

      // Get selected concerns
      const checked = $concernsList.find('input[type="checkbox"]:checked');
      const newConcerns = [];

      checked.each(function () {
        const concern = $(this).next("label").text();
        newConcerns.push(concern);
      });

      if (newConcerns.length > 0) {
        selections[currentArea] = newConcerns;
      } else {
        // Remove area if no concerns selected
        delete selections[currentArea];
      }

      updateSelections();
      closeModal();
    });

    function updateSelections() {
      // Count total concerns
      let totalCount = 0;
      for (let area in selections) {
        totalCount += selections[area].length;
      }

      $selectionCount.text(totalCount);
      $expandedSelectionCount.text(totalCount);

      if (totalCount === 0) {
        $noSelections.show();
        $startMessage.show();
        $selectionsList.empty();
        $expandSelectionsBtn.hide();
        $selectionsPanel.removeClass("expanded");
      } else {
        $noSelections.hide();
        $startMessage.hide();
        $expandSelectionsBtn.show();

        $selectionsList.empty();

        for (let area in selections) {
          const concerns = selections[area];
          if (concerns.length > 0) {
            const $item = $('<div class="selection-item"></div>');

            const $header = $('<div class="selection-item-header"></div>');
            $header.append(
              $('<span class="selection-item-area">' + area + "</span>")
            );

            const $removeBtn = $(
              '<button class="remove-selection" data-area="' +
                area +
                '">×</button>'
            );
            $removeBtn.on("click", function () {
              delete selections[area];
              updateSelections();
              updateExpandedSelections();
            });
            $header.append($removeBtn);

            const $concernsDiv = $(
              '<div class="selection-item-concerns"></div>'
            );
            const $concernsUl = $("<ul></ul>");
            concerns.forEach(function (concern) {
              $concernsUl.append($("<li>" + concern + "</li>"));
            });
            $concernsDiv.append($concernsUl);

            $item.append($header).append($concernsDiv);
            $selectionsList.append($item);
          }
        }
      }

      updateExpandedSelections();
    }

    function updateExpandedSelections() {
      $expandedSelectionsList.empty();

      let totalCount = 0;
      for (let area in selections) {
        totalCount += selections[area].length;
      }

      if (totalCount === 0) {
        $expandedSelectionsList.append(
          $(
            '<p style="text-align: center; color: #666; padding: 40px;">No concerns selected.</p>'
          )
        );
        return;
      }

      for (let area in selections) {
        const concerns = selections[area];
        if (concerns.length > 0) {
          const $areaGroup = $('<div class="concern-area-group"></div>');
          $areaGroup.append($("<h3>" + area + "</h3>"));

          const $chipsContainer = $("<div></div>");
          concerns.forEach(function (concern) {
            const $chip = $('<span class="concern-chip"></span>');
            $chip.append($("<span>" + concern + "</span>"));

            const $removeBtn = $(
              '<button class="concern-chip-remove" data-area="' +
                area +
                '" data-concern="' +
                concern +
                '">×</button>'
            );
            $removeBtn.on("click", function () {
              const areaName = $(this).data("area");
              const concernName = $(this).data("concern");
              if (selections[areaName]) {
                const index = selections[areaName].indexOf(concernName);
                if (index > -1) {
                  selections[areaName].splice(index, 1);
                  if (selections[areaName].length === 0) {
                    delete selections[areaName];
                  }
                  updateSelections();
                }
              }
            });
            $chip.append($removeBtn);
            $chipsContainer.append($chip);
          });
          $areaGroup.append($chipsContainer);
          $expandedSelectionsList.append($areaGroup);
        }
      }
    }

    // How to use link
    const $howToUseModal = $("#how-to-use-modal");
    const $closeHowToUseModal = $("#close-how-to-use-modal");
    const $closeHowToUseBtn = $("#close-how-to-use-btn");

    $("#how-to-use-btn").on("click", function (e) {
      e.preventDefault();
      $howToUseModal.fadeIn(300);
    });

    $closeHowToUseModal.on("click", function () {
      $howToUseModal.fadeOut(300);
    });

    $closeHowToUseBtn.on("click", function () {
      $howToUseModal.fadeOut(300);
    });

    // Click outside modal to close
    $howToUseModal.on("click", function (e) {
      if ($(e.target).hasClass("llvc-modal-overlay")) {
        $howToUseModal.fadeOut(300);
      }
    });

    // Expand/Collapse Selections Panel
    $expandSelectionsBtn.on("click", function () {
      $expandedSelections.fadeIn(300);
      updateExpandedSelections();
    });

    // Back from expanded selections
    $backFromSelectionsBtn.on("click", function () {
      $expandedSelections.fadeOut(300);
    });

    // Clear all selections
    $clearAllBtn.on("click", function () {
      if (confirm("Are you sure you want to clear all selections?")) {
        for (let area in selections) {
          delete selections[area];
        }
        updateSelections();
      }
    });

    // Select more concerns button
    $selectMoreConcernsBtn.on("click", function () {
      $expandedSelections.fadeOut(300);
      $selectionsPanel.removeClass("collapsed");
    });

    // Finish consultation button
    $finishConsultationBtn.on("click", function () {
      let totalCount = 0;
      for (let area in selections) {
        totalCount += selections[area].length;
      }

      if (totalCount === 0) {
        alert(
          "Please select at least one concern before finishing your consultation."
        );
        return;
      }

      $expandedSelections.fadeOut(300);
      $leadCapture.fadeIn(300);
    });

    // Lead capture form submission
    $leadCaptureForm.on("submit", function (e) {
      e.preventDefault();

      const firstName = $("#first-name").val();
      const lastName = $("#last-name").val();
      const email = $("#email").val();
      const phone = $("#phone").val();

      // Here you would typically send this data to a server
      console.log("Form submitted:", {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        selections: selections,
      });

      // For now, just show an alert
      alert(
        "Thank you! Your information has been submitted. You will receive your personalized treatment plan shortly."
      );

      // Reset form
      $leadCaptureForm[0].reset();
    });

    // Theme Toggle Functionality
    const $themeToggle = $("#theme-toggle");
    const $body = $("body");
    const $logoImg = $("#logo-img");
    const $logoText = $("#logo-text");
    const $logoLink = $("#logo-link");
    const $providerSection = $("#provider-section");
    const $providerImg = $("#provider-img");
    const $providerName = $("#provider-name");
    const $providerTitle = $("#provider-title");
    const $providerBio = $("#provider-bio");
    const $providerSpecialties = $("#provider-specialties");
    const $welcomeTitle = $("#welcome-title");
    const $welcomeDescription = $("#welcome-description");
    const $startBtnText = $("#start-btn-text");

    // Unique Aesthetics Branding Data
    const brandedTheme = {
      logoUrl:
        "https://www.datocms-assets.com/163832/1753199215-unique_physique.svg",
      logoLink: "https://www.myuniqueaesthetics.com/",
      provider: {
        name: "Amber",
        title: "Lead Aesthetic Specialist",
        bio: "Expert in injectables and facial aesthetics with a passion for natural-looking results.",
        image: "amber.jpg",
        specialties: ["BOTOX", "Dermal Fillers", "Xeomin", "Lip Fillers"],
      },
      welcome: {
        title: "Welcome to Unique Aesthetics & Wellness",
        description:
          "Where Luxury Aesthetic Treatment Feels Like Home. All virtual submissions are confidential and will only be shared with your provider.",
        cta: "Book at Unique Aesthetics",
      },
    };

    // Default Theme Data
    const defaultTheme = {
      logoUrl: "",
      logoLink: "https://liftedlogic.com",
      provider: null,
      welcome: {
        title: "Welcome to your treatment builder!",
        description:
          "All virtual submissions are confidential and will only be shared with your Lifted Logic Provider.",
        cta: "Start Consultation",
      },
    };

    let isBranded = false;

    function applyTheme(theme) {
      if (theme === "branded") {
        $body.addClass("theme-branded");
        isBranded = true;

        // Update logo
        if (brandedTheme.logoUrl) {
          $logoImg.attr("src", brandedTheme.logoUrl).show();
          $logoText.hide();
        }
        $logoLink.attr("href", brandedTheme.logoLink);

        // Show provider section
        if (brandedTheme.provider) {
          $providerName.text(brandedTheme.provider.name);
          $providerTitle.text(brandedTheme.provider.title);
          $providerBio.text(brandedTheme.provider.bio);

          // Set provider image if available
          if (brandedTheme.provider.image) {
            $providerImg.attr("src", brandedTheme.provider.image).show();
          }

          // Add specialties
          $providerSpecialties.empty();
          brandedTheme.provider.specialties.forEach((specialty) => {
            const $badge = $(
              '<span class="llvc-provider-specialty"></span>'
            ).text(specialty);
            $providerSpecialties.append($badge);
          });

          $providerSection.show();
        }

        // Update welcome text
        $welcomeTitle.text(brandedTheme.welcome.title);
        $welcomeDescription.text(brandedTheme.welcome.description);
        $startBtnText.text(brandedTheme.welcome.cta);

        // Update toggle button
        $themeToggle.find(".theme-toggle-text").text("Default");
      } else {
        $body.removeClass("theme-branded");
        isBranded = false;

        // Update logo
        $logoImg.hide();
        $logoText.show();
        $logoLink.attr("href", defaultTheme.logoLink);

        // Hide provider section
        $providerSection.hide();

        // Update welcome text
        $welcomeTitle.text(defaultTheme.welcome.title);
        $welcomeDescription.text(defaultTheme.welcome.description);
        $startBtnText.text(defaultTheme.welcome.cta);

        // Update toggle button
        $themeToggle.find(".theme-toggle-text").text("Branded");
      }
    }

    // Toggle theme on button click
    $themeToggle.on("click", function () {
      if (isBranded) {
        applyTheme("default");
      } else {
        applyTheme("branded");
      }
    });

    // Initialize with default theme
    applyTheme("default");
  });
})(jQuery);
