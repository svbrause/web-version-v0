# Airtable Setup Guide for New Body Concerns

## Table: Photos

Yes, the **Photos** table is correct! This is the table your app reads from.

## Required Columns/Fields

Your Airtable table should have these columns (the app will look for these field names):

### Essential Fields:

1. **Name** (Single line text)

   - The treatment name (e.g., "Motus AZ+ Laser Hair Removal")

2. **Before After** or **Before/After** or **Image** or **Photo** (Attachment field)

   - Upload the before/after image here
   - This is the most important field - the app looks for attachment fields

3. **Matching Criteria** (Multiple select or Single line text)
   - **CRITICAL**: This determines which concerns the case will show up for
   - Use comma-separated values or multiple select tags
   - Values should be lowercase with hyphens (e.g., "unwanted-hair", "stubborn-fat")

### Recommended Fields:

4. **Story Title** (Single line text)

   - Short catchy title for the case
   - Example: "Smooth, hair-free skin with virtually painless laser treatment"
   - _Note: The app also recognizes "Headline", "Title", "Case Title", etc. if you have those fields_

5. **Story Detailed** (Long text)

   - Patient story/background
   - Example: "This patient was tired of the constant upkeep of shaving and waxing..."
   - _Note: The app also recognizes "Story", "Description", "Patient Story", etc. if you have those fields_

6. **Treatment** or **Treatment Details** (Long text)

   - Description of the treatment performed
   - Example: "Motus AZ+ laser hair removal treatment using advanced Moveo technology..."

7. **Solved** or **Issues Solved** (Multiple select or Single line text)

   - What issues this case addresses
   - Example: "unwanted hair", "hair removal", "ingrown hairs"

8. **Patient Name** (Single line text)

   - Optional: Patient name (defaults to "Patient" if not provided)

9. **Age** or **Patient Age** (Number)
   - Optional: Patient age in years

---

## Example Rows to Add

### Row 1: Unwanted Hair Case

| Field                 | Value                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**              | `Motus AZ+ Laser Hair Removal`                                                                                                                                                                                                                                                                                                                            |
| **Before After**      | [Upload your before/after image]                                                                                                                                                                                                                                                                                                                          |
| **Matching Criteria** | `unwanted-hair, laser-hair-removal, hair-removal, body-hair, facial-hair`                                                                                                                                                                                                                                                                                 |
| **Story Title**       | `Smooth, hair-free skin with virtually painless laser treatment`                                                                                                                                                                                                                                                                                          |
| **Story Detailed**    | `This patient was tired of the constant upkeep of shaving and waxing, especially dealing with ingrown hairs and irritation in sensitive areas. She wanted a long-term solution that would simplify her routine and give her smooth, carefree skin without the hassle of daily maintenance.`                                                               |
| **Treatment**         | `Motus AZ+ laser hair removal treatment using advanced Moveo technology for virtually painless, efficient hair reduction. The dual-wavelength system (Alexandrite and Nd:YAG) safely treats all skin types, including deeper tones. Treatment sessions are fast and comfortable, with gradual hair reduction over 6-8 sessions spaced a few weeks apart.` |
| **Solved**            | `unwanted hair, hair removal, ingrown hairs`                                                                                                                                                                                                                                                                                                              |
| **Patient Name**      | `Jessica` (optional)                                                                                                                                                                                                                                                                                                                                      |
| **Age**               | `32` (optional)                                                                                                                                                                                                                                                                                                                                           |

---

### Row 2: Stubborn Fat Case (PHYSIQ 360)

| Field                 | Value                                                                                                                                                                                                                                                                                                                                                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**              | `PHYSIQ 360 Body Contouring`                                                                                                                                                                                                                                                                                                                                         |
| **Before After**      | [Upload your before/after image]                                                                                                                                                                                                                                                                                                                                     |
| **Matching Criteria** | `stubborn-fat, body-contouring, fat-reduction, body-sculpting, trouble-spots`                                                                                                                                                                                                                                                                                        |
| **Story Title**       | `Refining body contours with dual-action technology`                                                                                                                                                                                                                                                                                                                 |
| **Story Detailed**    | `After significant weight loss, this patient was left with stubborn fat deposits that wouldn't respond to diet and exercise. She wanted to refine her shape and tone specific trouble spots without surgery or downtime, maintaining her natural silhouette with targeted body contouring.`                                                                          |
| **Treatment**         | `PHYSIQ 360 body contouring treatment combining fat reduction and muscle stimulation in a single session. The advanced non-invasive device uses independently controlled applicators for precise, personalized treatment. Each 30-60 minute session targets fat cells while toning muscles, with results building over time through a recommended treatment series.` |
| **Solved**            | `stubborn fat, body contouring, fat reduction`                                                                                                                                                                                                                                                                                                                       |
| **Patient Name**      | `Amanda` (optional)                                                                                                                                                                                                                                                                                                                                                  |
| **Age**               | `38` (optional)                                                                                                                                                                                                                                                                                                                                                      |

---

### Row 3: Stubborn Fat Case (Everesse)

| Field                 | Value                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**              | `Everesse RF Body Contouring`                                                                                                                                                                                                                                                                                                                                                         |
| **Before After**      | [Upload your before/after image]                                                                                                                                                                                                                                                                                                                                                      |
| **Matching Criteria** | `stubborn-fat, body-contouring, fat-reduction, rf-treatment, non-surgical`                                                                                                                                                                                                                                                                                                            |
| **Story Title**       | `Non-invasive body contouring for stubborn fat reduction`                                                                                                                                                                                                                                                                                                                             |
| **Story Detailed**    | `This patient struggled with stubborn fat in her abdomen and thighs that persisted despite maintaining a healthy lifestyle. She was looking for a non-surgical solution that would target these specific areas without the downtime or discomfort of invasive procedures.`                                                                                                            |
| **Treatment**         | `Everesse RF (Radio Frequency) body contouring treatment using advanced technology to target and reduce fat cells without surgery. The treatment works by heating fat cells to break them down, with the body naturally metabolizing the treated fat over several weeks. Results develop gradually, with optimal outcomes visible after completing the recommended treatment series.` |
| **Solved**            | `stubborn fat, body contouring, fat reduction`                                                                                                                                                                                                                                                                                                                                        |
| **Patient Name**      | `Michelle` (optional)                                                                                                                                                                                                                                                                                                                                                                 |
| **Age**               | `41` (optional)                                                                                                                                                                                                                                                                                                                                                                       |

---

### Row 4: Weight Loss Case (Example)

| Field                 | Value                                                           |
| --------------------- | --------------------------------------------------------------- |
| **Name**              | `Weight Loss Program` (or your actual treatment name)           |
| **Before After**      | [Upload your before/after image]                                |
| **Matching Criteria** | `weight-loss, weight-management, weight-reduction, body-weight` |
| **Story Title**       | `Achieving sustainable weight loss results`                     |
| **Story Detailed**    | `[Your patient story about weight loss journey]`                |
| **Treatment**         | `[Description of your weight loss treatment/program]`           |
| **Solved**            | `weight loss, weight management`                                |
| **Patient Name**      | `[Patient name]` (optional)                                     |
| **Age**               | `[Age]` (optional)                                              |

---

## Important Notes:

1. **Matching Criteria Format**:

   - Use lowercase with hyphens (e.g., `unwanted-hair` not `Unwanted Hair`)
   - Separate multiple values with commas if using a text field
   - Or use multiple select tags if your field supports it

2. **Image Field**:

   - Must be an **Attachment** field type in Airtable
   - Upload the before/after image
   - The app will automatically use this for both thumbnail and full-size display

3. **Field Name Flexibility**:

   - The app looks for multiple field name variations, so if your field is named slightly differently, it should still work
   - For images, it checks: "Before After", "Before/After", "Image", "Photo", "Photos", etc.
   - For matching criteria, it checks: "Matching Criteria", "Criteria", "Tags", "Keywords", etc.

4. **Minimum Required**:

   - At minimum, you need: **Name**, **Before After** (image), and **Matching Criteria**
   - Other fields will be auto-generated if missing, but it's better to provide them
   - **Story Title** and **Story Detailed** are recommended for better case descriptions

5. **Multiple Cases**:
   - You can add multiple cases for the same concern (e.g., multiple "Stubborn Fat" cases)
   - Just make sure they all have the appropriate matching criteria

---

## Quick Checklist:

- [ ] Add row with **Name**: "Motus AZ+ Laser Hair Removal"
- [ ] Add **Before After** image (attachment)
- [ ] Add **Matching Criteria**: "unwanted-hair, laser-hair-removal, hair-removal"
- [ ] Add row with **Name**: "PHYSIQ 360 Body Contouring"
- [ ] Add **Before After** image (attachment)
- [ ] Add **Matching Criteria**: "stubborn-fat, body-contouring, fat-reduction"
- [ ] Add row with **Name**: "Everesse RF Body Contouring"
- [ ] Add **Before After** image (attachment)
- [ ] Add **Matching Criteria**: "stubborn-fat, body-contouring, fat-reduction"
- [ ] (Optional) Add Weight Loss cases with **Matching Criteria**: "weight-loss, weight-management"

Once you add these rows to Airtable, refresh your app and the cases should appear when users select these concerns!
