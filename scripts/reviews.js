let form_add = null;
let form_update = null;
let form_delete = null;
let selected_review_id = null;
let buttons_delete = null;
let buttons_update = null;
let id = null;
let db = null;

function openModalAdd() {
    modal_add.classList.add("blur");
    modal_add.style.display = "block";
}

function openModalDelete() {
    modal_delete.classList.add("blur");
    modal_delete.style.display = "block";
}

function openModalUpdate() {
    if(!selected_review_id) {
        return
    }
    let reviews = localStorage.getItem('reviews_'+id);
    if(!reviews) {
        return
    } 
    reviews = JSON.parse(reviews);
    const selected_id = selected_review_id.split('-')[1];
    const review = reviews.find(el=>el.id === Number(selected_id));
    const name = document.getElementById("name-update");
    const comment = document.getElementById("review-update");
    name.value = review.name;
    comment.value = review.comment;
    modal_update.classList.add("blur");
    modal_update.style.display = "block";
}

function closeModalAdd() {
    modal_add.style.display = "none";
    modal_add.classList.remove("blur");
    form_add.reset();
}

function closeModalUpdate() {
    modal_update.style.display = "none";
    modal_update.classList.remove("blur");
    form_update.reset();
}

function closeModalDelete() {
    modal_delete.style.display = "none";
    modal_delete.classList.remove("blur");
    form_delete.reset();
}

function onDocumentLoad() {
    modal_add = document.getElementById("addModal");
    modal_delete = document.getElementById("deleteModal");
    modal_update = document.getElementById("updateModal");
    button_add = document.querySelector('.add-button');
    button_submit_add = document.getElementById('btn-submit-add');
    button_submit_delete = document.getElementById('btn-submit-delete');
    button_submit_update = document.getElementById('btn-submit-update');
    form_add = document.getElementById("formAdd");
    form_update = document.getElementById("formUpdate");
    form_delete = document.getElementById("formDelete");
    body = document.getElementsByTagName('body')[0];
    button_add.addEventListener('click', () => {
        openModalAdd();
    })
    button_submit_add.addEventListener('click', (e) => {
        e.preventDefault();
        addReview();
    })
    button_submit_delete.addEventListener('click', (e) => {
        e.preventDefault();
        deleteReview();
        closeModalDelete();
    })
    button_submit_update.addEventListener('click', (e) => {
        e.preventDefault();
        updateReview();
    })
}
function addReview() {
    let reviews = localStorage.getItem('reviews_'+id);
    if(!reviews) {
      reviews = JSON.stringify([]);
    }
    reviews = JSON.parse(reviews);
    const name = document.getElementById("name").value;
    const comment = document.getElementById("review").value;
    const review ={
        id: Math.floor(Math.random() * 1000),
        name,
        comment
    }
    reviews.push(review)
    localStorage.setItem('reviews_'+id, JSON.stringify(reviews));
    closeModalAdd()
    displayReviews()
}
function updateReview() {
    if(!selected_review_id) {
        return
    }
    let reviews =localStorage.getItem('reviews_'+id);
    if(!reviews) {
        return
    } 
    reviews = JSON.parse(reviews);
    const selected_id = selected_review_id.split('-')[1];
    reviews = reviews.filter(review=>review.id !== Number(selected_id));
    const length = reviews?.length || 0;
    const name = document.getElementById("name-update").value;
    const comment = document.getElementById("review-update").value;
    const el = {
        id:  Math.floor(Math.random() * 1000),
        name,
        comment
    }
    reviews.push(el)
    localStorage.setItem('reviews_'+id, JSON.stringify(reviews));
    displayReviews();
    closeModalUpdate();
}
function deleteReview() {
    if(!selected_review_id) {
        return
    }
    let reviews =localStorage.getItem('reviews_'+id);
    if(!reviews) {
        return
    }
    reviews = JSON.parse(reviews);
    const selected_id = selected_review_id.split('-')[1];
    reviews = reviews.filter(review=>review.id !== Number(selected_id));
    localStorage.setItem('reviews_'+id, JSON.stringify(reviews));
    displayReviews();

}
function addActionButtonsListeners() {
    buttons_update = document.querySelectorAll('.update-button');
    buttons_delete = document.querySelectorAll('.delete-button');
    if(!buttons_delete || !buttons_update) {
        return
    }
    for(const button_update of buttons_update) {
        button_update.addEventListener('click', (e)=>{
            selected_review_id = e.target.closest('.review').id;
           openModalUpdate();
        })
    }
    for(const button_delete of buttons_delete) {
        button_delete.addEventListener('click', (e)=>{
            selected_review_id = e.target.closest('.review').id;
           openModalDelete();
        })
    }
}
function displayReviews() {
    let reviews = localStorage.getItem('reviews_'+id);
    const reviews_list = document.querySelector(".reviews");
    if(!reviews || !reviews?.length) {
        reviews_list.innerHTML = ""
        return
    }
    reviews = JSON.parse(reviews);
    reviews_list.innerHTML = ""
    for (const review of reviews) {
        let el = document.createElement('div');
        el.classList.add('review');
        el.id = `review-${review.id}`
        const elContent = `
        
        <h2 class="reviewer-name">${review.name}</h2>
        <p>
            ${review.comment}
        </p>
        <div class="review-action-buttons">
            <div class="action-button-wrapper">
            <button id="update-button-${review.id}" class="action-item update-button">Обновить отзыв</button>
            </div>
            <div class="action-button-wrapper">
                <button id="delete-button-${review.id}" class="action-item delete-button">Уалить отзыв</button>
            </div>
        </div>
        `
        el.innerHTML = elContent;
        reviews_list.appendChild(el);
    }
    addActionButtonsListeners();
}
document.addEventListener('click', (e) => {
    const addModalContent = document.querySelector('#addModal .modal-content');
    if (!addModalContent.contains(e.target)  && e.target !== button_add ) {
        closeModalAdd();
    }

    const deleteModalContent = document.querySelector('#deleteModal .modal-content');
    if (!deleteModalContent.contains(e.target)  && !Array.from(buttons_delete ?? []).includes(e.target)) {
        closeModalDelete();
    }

    const updateModalContent = document.querySelector('#updateModal .modal-content');
    if (!updateModalContent.contains(e.target)  && !Array.from(buttons_update ?? []).includes(e.target) ) {
        closeModalUpdate();
    }
})
function initPageContent() {
    const dbPromise = window.indexedDB.open('projectsDB', 1);
    dbPromise.onsuccess = function (event) {
        db = event.target.result;
        const tx = db.transaction('projects', 'readonly');
        const store = tx.objectStore('projects');
        const request = store.get(Number(id));
        request.onsuccess = function(event) {
            let project = event.target.result;
            const image_blob = new Blob([project.image], { type: "image/jpeg" });
            const image_url = URL.createObjectURL(image_blob);
            document.querySelector('.description').textContent = project.description;
            document.querySelector('.image').src = image_url;
            displayReviews()
        }
    };
}
document.addEventListener('DOMContentLoaded', () => {
  const url = new URL(window.location.href)
  id = new URLSearchParams(url.search).get('id');
  initPageContent();
  onDocumentLoad();
});