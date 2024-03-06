let modal_add = null;
let modal_update = null;
let modal_delete = null;
let body = null;
let form_add = null;
let form_update = null;
let form_delete = null;
let button_add = null;
let button_find = null;
let button_sort = null;
let button_submit_add = null;
let button_submit_delete = null;
let button_submit_update = null;
let button_delete = null;
let button_update = null;
let file = null;
let file_input = null;
let db = null;

function deleteItem(id) {
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
    const request = store.delete(+id);

    request.onsuccess = function() {
        displayItems();
    };

    request.onerror = function() {
        console.error('Error deleting item');
    };
}
function findItemsByName(name) {
    const tx = db.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');
    const index = store.index('name');

    const request = index.getAll(name);

    request.onsuccess = function(event) {
        const items = event.target.result;
        if (items && items.length > 0) {
            console.log('Найдены элементы:', items);
            const ids = items.map(item => item.id); // Получаем массив id найденных элементов
            displayItems(ids);
        } else {
            displayItems();
            console.log('Элементы с заданным именем не найдены');
        }
    };

    request.onerror = function() {
        console.error('Ошибка при поиске элементов');
    };
}
function sortItems()
{
    const sortMode = document.getElementById("sort-mode").value;
    const sortDirection = document.getElementById("sort-direction").value;
    const startDateTime = document.getElementById("startDateTime").value;
    const endDateTime = document.getElementById("endDateTime").value;

    const tx = db.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');

    const request = store.getAll();

    request.onsuccess = function(event) {
        let sortedProjects = event.target.result;

        if(sortMode==="name")
        {
            sortedProjects.sort((a, b) => {
                const nameA = a.name.toUpperCase();
                const nameB = b.name.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
        }
        if(sortMode === 'date_create' || sortMode === 'date_update')
        {
            if (startDateTime || endDateTime) {
                sortedProjects = sortedProjects.filter(project => {
                    let projectDate;
                    if (sortMode === 'date_create') {
                        projectDate = new Date(project.createdAt);
                    } else if (sortMode === 'date_update') {
                        projectDate = new Date(project.updatedAt);
                    }

                    const startDate = startDateTime ? new Date(startDateTime) : null;
                    const endDate = endDateTime ? new Date(endDateTime) : null;

                    if (startDate && endDate) {
                        return projectDate >= startDate && projectDate <= endDate;
                    } else if (startDate) {
                        return projectDate >= startDate;
                    } else if (endDate) {
                        return projectDate <= endDate;
                    }

                    return true;
                });
            }

            if(sortMode==='date_create')
            {
                sortedProjects.sort((a, b) => a.createdAt - b.createdAt);
            }
            if(sortMode==='date_update')
            {
                sortedProjects.sort((a, b) => a.updatedAt - b.updatedAt);
            }
        }

        if(sortDirection==='asc')
        {
            sortedProjects.reverse();
        }

        const ids = sortedProjects.map(item => item.id);
        displayItems(ids);
        console.log('Отсортированные проекты:', sortedProjects);
    };

    request.onerror = function() {
        console.error('Ошибка при выполнении сортировки');
    };
}
function updateItem(id) {
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');

    const getRequest = store.get(+id);

    getRequest.onsuccess = function(event) {
        const oldItem = event.target.result;

        const nameChange = document.getElementById("nameChange").value;
        const descriptionChange = document.getElementById("descriptionChange").value;
        const dateChange = document.getElementById("dateChange").value;
        const previewChange = document.getElementById("previewChange").files[0];

        if (previewChange) {
            const reader = new FileReader();
            reader.readAsDataURL(previewChange);
        }
        console.log('nameChange')
        console.log(nameChange)

        const currentTime = new Date();
        const dbItem = {
            name: nameChange || oldItem.name,
            description: descriptionChange || oldItem.description,
            date: dateChange || oldItem.date,
            image: previewChange || oldItem.image,
            createdAt : oldItem.createdAt,
            updatedAt : currentTime,
        };

        const updateRequest = store.put({ ...dbItem, id: +id });

        updateRequest.onsuccess = function() {
            console.log('Элемент успешно обновлен');
            displayItems();
            closeModalUpdate();
        };

        updateRequest.onerror = function() {
            console.error('Ошибка при обновлении элемента');
        };
    };

    getRequest.onerror = function() {
        console.error('Ошибка при получении элемента для обновления');
    };
}

function displayItems(filterSortedIds = []) {
    console.log(db);
    const tx = db.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');
    const request = store.getAll();

    request.onsuccess = function(event) {
        let projects = event.target.result;
        console.log('Ваши проекты:  ');
        console.log(projects);

        if (filterSortedIds.length !== 0) {
            projects = filterSortedIds.map(id => projects.find(project => project.id === id));
        }

        const projects_list = document.getElementById("projects-list");
        projects_list.innerHTML = ""
        const insertIndex = projects_list.rows.length;



        projects.forEach(project=>{
            const row = projects_list.insertRow(insertIndex);
            const cell_name = row.insertCell(0);
            const cell_description = row.insertCell(1);
            const cell_date = row.insertCell(2);
            const cell_image = row.insertCell(3);
            const cell_update = row.insertCell(4);
            const cell_delete = row.insertCell(5);

            const image_blob = new Blob([project.image], { type: "image/jpeg" });
            const image_url = URL.createObjectURL(image_blob);

            //project.id place somewhere
            row.id = project.id;
            cell_name.innerHTML = project.name;
            cell_description.innerHTML = project.description;
            cell_date.innerHTML = project.date;
            cell_image.classList.add('image-cell');
            cell_image.innerHTML = `
    <div class="image-wrapper">
       <img class="image" src="${image_url}" alt="${project.name}">
    </div>`
            cell_update.innerHTML = `
            <div class="action-button-wrapper">
                <button id="update-button" class="action-item update-button">O</button>
            </div>
            `
            cell_delete.innerHTML = `
            <div class="action-button-wrapper">
                <button id="delete-button" class="action-item delete-button">X</button>
            </div>
            `
        });
    };

    request.onerror = function() {
        console.error('Error displaying items');
    };
}
function handleFileSelect(event) {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
        file = event.target.result;
    };
    reader.readAsDataURL(selectedFile);
}

function openModalAdd() {
    modal_add.classList.add("blur");
    modal_add.style.display = "block";
}

function openModalDelete() {
    modal_delete.classList.add("blur");
    modal_delete.style.display = "block";
}

function openModalUpdate() {
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
document.addEventListener('click', (e) => {
    const addModalContent = document.querySelector('#addModal .modal-content');
    if (!addModalContent.contains(e.target)  && e.target !== button_add ) {
        closeModalAdd();
    }

    const deleteModalContent = document.querySelector('#deleteModal .modal-content');
    if (!deleteModalContent.contains(e.target)  && e.target !== button_delete ) {
        closeModalDelete();
    }

    const updateModalContent = document.querySelector('#updateModal .modal-content');
    if (!updateModalContent.contains(e.target)  && e.target !== button_update ) {
        closeModalUpdate();
    }
})
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-button')) {
        const row = e.target.closest('tr');
        const row_id = row.id;
        localStorage.setItem('delete-item-id', row_id);
        openModalDelete();
    }
    if (e.target.classList.contains('update-button')) {
        const row = e.target.closest('tr');
        const row_id = row.id;
        localStorage.setItem('update-item-id', row_id);
        openModalUpdate();
    }
});

document.addEventListener('DOMContentLoaded', () => {

    const dbPromise = window.indexedDB.open('projectsDB', 1);

    dbPromise.onupgradeneeded = function (event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('projects', {keyPath: 'id', autoIncrement: true});
        objectStore.createIndex('name', 'name', {unique: false});
        objectStore.createIndex('description', 'description', {unique: false});
        objectStore.createIndex('date', 'date', {unique: false});
        objectStore.createIndex('createdAt', 'createdAt', {unique: false});
        objectStore.createIndex('updatedAt', 'updatedAt', {unique: false});
    };

    dbPromise.onsuccess = function (event) {
        console.log('Database opened successfully');
        db = event.target.result;

        displayItems();
    };

    modal_add = document.getElementById("addModal");
    modal_delete = document.getElementById("deleteModal");

    modal_update = document.getElementById("updateModal");
    button_add = document.querySelector('.add-button');
    button_find = document.getElementById('find-button');
    button_sort = document.getElementById('sort-button');
    button_submit_add = document.getElementById('btn-submit-add');
    button_delete = document.querySelector('.delete-button');

    button_submit_delete = document.getElementById('btn-submit-delete');
    button_update = document.querySelector('.update-button');
    button_submit_update = document.getElementById('btn-submit-update');

    form_add = document.getElementById("formAdd");
    form_update = document.getElementById("formUpdate");
    form_delete = document.getElementById("formDelete");
    body = document.getElementsByTagName('body')[0];
    file_input = document.getElementById("preview");
    file_input.addEventListener('change', (e) => {
        handleFileSelect(e);
    })

    button_add.addEventListener('click', () => {
        openModalAdd();
    })
    button_find.addEventListener('click', (e) => {
        e.preventDefault();
        const find_input = document.getElementById("find-input").value;
        findItemsByName(find_input);
    })
    button_sort.addEventListener('click', () => {
        console.log('sort')
        sortItems();
    })
    button_submit_add.addEventListener('click', (e) => {
        e.preventDefault();
        addRow();
    })

    button_submit_delete.addEventListener('click', (e) => {
        e.preventDefault();
        const delete_item_id = localStorage.getItem('delete-item-id');
        deleteItem(delete_item_id);
        closeModalDelete();
    })

    button_submit_update.addEventListener('click', (e) => {
        e.preventDefault();
        const update_item_id = localStorage.getItem('update-item-id');
        updateItem(update_item_id);
    })




    function addRow() {
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const date = document.getElementById("date").value;
        const preview = document.getElementById("preview").files[0];
        if (!name || !preview || !date || !description) {
            alert('Заполните все поля')
            return
        }

        const reader = new FileReader();
        reader.readAsDataURL(preview);

        const currentDate = new Date();
        const dbItem = {
            name: name,
            description: description,
            date: date,
            image: preview,
            createdAt: currentDate,
            updatedAt: currentDate,
        };
        const tx = db.transaction('projects', 'readwrite');
        const store = tx.objectStore('projects');
        const request = store.add(dbItem);

        closeModalAdd();

        request.onsuccess = function () {
            displayItems();
        };

        request.onerror = function () {
            console.error('Error adding item');
        };
    }
});