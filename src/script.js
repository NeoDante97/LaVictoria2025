import {
  renderMonthCalendar
} from './calendar.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const adminSection = document.getElementById('adminSection');
  const visitorSection = document.getElementById('visitorSection');
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const visitorLoginBtn = document.getElementById('visitorLoginBtn');
  const changeUserBtn = document.getElementById('changeUserBtn');
  const searchBtn = document.getElementById('searchBtn');
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  const monthContainer = document.getElementById('monthContainer');
  const visitorMonthContainer = document.getElementById('visitorMonthContainer');
  const modalContainer = document.getElementById('modalContainer');
  const modalContent = document.getElementById('modalContent');
  const monthListContainer = document.getElementById('monthListContainer');
  const calendarViewContainer = document.getElementById('calendarViewContainer');
  const addUserBtn = document.getElementById('addUserBtn');
  const dayDetailsContainer = document.getElementById('dayDetailsContainer');
  const visitorMonthListContainer = document.getElementById('visitorMonthListContainer');
  const visitorCalendarViewContainer = document.getElementById('visitorCalendarViewContainer');
  const visitorDayDetailsContainer = document.getElementById('visitorDayDetailsContainer');
  const searchResultsContainer = document.getElementById('searchResultsContainer');

  let isAdmin = false;
  let isVisitor = false;
  let currentMonth = null;
  let selectedDayCell = null;

  let monthVisibility = {
    Enero: true,
    Febrero: true,
    Marzo: true,
    Abril: true,
    Mayo: true,
    Junio: true,
    Julio: true,
    Agosto: true,
    Septiembre: true,
    Octubre: true,
    Noviembre: true,
    Diciembre: true
  };

  let dayCheckState = {};

  let studentData = [];

  // Function to load data from localStorage
  function loadData() {
    const storedStudentData = localStorage.getItem('studentData');
    const storedMonthVisibility = localStorage.getItem('monthVisibility');
    const storedDayCheckState = localStorage.getItem('dayCheckState');

    if (storedStudentData) {
      studentData = JSON.parse(storedStudentData);
    }
    if (storedMonthVisibility) {
      monthVisibility = JSON.parse(storedMonthVisibility);
    }
    if (storedDayCheckState) {
      dayCheckState = JSON.parse(storedDayCheckState);
    }
  }

  // Load data when the page loads
  loadData();

  function showModal(content) {
    modalContent.innerHTML = content;
    modalContainer.style.display = 'block';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', closeModal);
    modalContent.appendChild(closeButton);
  }

  function closeModal() {
    modalContainer.style.display = 'none';
    modalContent.innerHTML = '';
  }

  if (changeUserBtn) {
    changeUserBtn.addEventListener('click', () => {
      adminSection.style.display = 'none';
      visitorSection.style.display = 'none';
      loginSection.style.display = 'block';
      changeUserBtn.style.display = 'none';
      searchBtn.style.display = 'none';
      saveChangesBtn.style.display = 'none';
      calendarViewContainer.innerHTML = '';
      dayDetailsContainer.style.display = 'none';
      visitorCalendarViewContainer.innerHTML = '';
      visitorDayDetailsContainer.style.display = 'none';
      searchResultsContainer.style.display = 'none';
      isAdmin = false;
      isVisitor = false;
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const searchModalContent = `
        <div class="search-modal-form">
          <h2>Buscar Estudiantes</h2>
          <label for="searchInput">DNI o Nombres:</label>
          <input type="text" id="searchInput" name="searchInput" placeholder="Ingrese DNI o Nombres" oninput="searchStudents()">
          <label for="searchGrado">Grado:</label>
          <input type="text" id="searchGrado" name="searchGrado" placeholder="Ingrese Grado" oninput="searchStudents()">
          <div id="searchResults"></div>
        </div>
      `;
      showModal(searchModalContent);

      window.searchStudents = function() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const searchGradoTerm = document.getElementById('searchGrado').value.toLowerCase();

        let results = studentData.filter(student =>
          student.dni.toLowerCase().includes(searchTerm) ||
          student.nombres.toLowerCase().includes(searchTerm)
        );

        if (searchGradoTerm) {
          results = results.filter(student => student.grado.toLowerCase().includes(searchGradoTerm));
        }

        displaySearchModalResults(results);
      };
    });
  }

  function displaySearchModalResults(results) {
    const searchResultsDiv = document.getElementById('searchResults');
    searchResultsDiv.innerHTML = '';

    if (results.length === 0) {
      searchResultsDiv.innerHTML = '<p>No se encontraron estudiantes.</p>';
      return;
    }

    results.forEach((student, index) => {
      const studentRecord = document.createElement('div');
      studentRecord.classList.add('student-record');
      studentRecord.innerHTML = `
        <div class="student-details-search">
          <p><strong>DNI:</strong> ${student.dni}</p>
          <p><strong>Nombres:</strong> ${student.nombres}</p>
          <p><strong>Apellidos:</strong> ${student.apellidos}</p>
          <p><strong>Grado:</strong> ${student.grado}</p>
          <p><strong>Sección:</strong> ${student.seccion}</p>
          <p><strong>Nivel:</strong> ${student.nivel}</p>
          <p><strong>Mes:</strong> ${student.month}</p>
          <p><strong>Día:</strong> ${student.day}</p>
          <button class="delete-student-btn" data-index="${index}" style="display: none;">Eliminar</button>
        </div>
        <img src="${student.imagen}" alt="${student.nombres}" class="student-image-search" onclick="openImageInFullScreen('${student.imagen}')">
      `;
      searchResultsDiv.appendChild(studentRecord);
    });

    const deleteButtons = document.querySelectorAll('.delete-student-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', function() {
        const index = this.dataset.index;
        deleteStudent(index);
      });
    });
  }

  window.deleteStudent = function(index) {
    const confirmDelete = confirm('¿Estás seguro de eliminar este dato del alumno?');
    if (confirmDelete) {
      studentData.splice(index, 1);
      saveData();
      showDayDetails(currentMonth, 1);
    }
  }

  function searchStudentsByMonth(month) {
    const results = studentData.filter(student => student.month.toLowerCase() === month.toLowerCase());
    return results;
  }

  function displaySearchResults(results) {
    if (!searchResultsContainer) return;

    searchResultsContainer.innerHTML = '';
    searchResultsContainer.style.display = 'block';

    if (results.length === 0) {
      searchResultsContainer.innerHTML = '<p>No se encontraron estudiantes para este mes.</p>';
      return;
    }

    results.forEach(student => {
      const studentRecord = document.createElement('div');
      studentRecord.classList.add('student-record');
      studentRecord.innerHTML = `
        <p><strong>DNI:</strong> ${student.dni}</p>
        <p><strong>Nombres:</strong> ${student.nombres}</p>
        <p><strong>Apellidos:</strong> ${student.apellidos}</p>
        <p><strong>Grado:</strong> ${student.grado}</p>
        <p><strong>Sección:</strong> ${student.seccion}</p>
        <p><strong>Nivel:</strong> ${student.nivel}</p>
        <p><strong>Mes:</strong> ${student.month}</p>
        <p><strong>Día:</strong> ${student.day}</p>
      `;
      searchResultsContainer.appendChild(studentRecord);
    });
  }

  function renderMonthList(container, isForAdmin, renderFunction) {
    if (!container) return;
    container.innerHTML = '';
    const months = Object.keys(monthVisibility);

    months.forEach(month => {
      const monthItem = document.createElement('div');
      monthItem.classList.add('month-list-item');

      const monthLabel = document.createElement('label');
      monthLabel.textContent = month;
      monthLabel.style.marginRight = '10px';

      monthItem.appendChild(monthLabel);

      if (isForAdmin) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = monthVisibility[month];
        checkbox.style.transform = 'scale(1.5)';
        checkbox.addEventListener('change', () => {
          monthVisibility[month] = checkbox.checked;
          saveData();
          renderVisitorView();
        });
        monthItem.appendChild(checkbox);
      }

      monthItem.addEventListener('click', () => {
        currentMonth = month;
        renderFunction(month);
      });

      container.appendChild(monthItem);
    });
  }

  function renderCalendarView(month, container, isAdminView = false) {
    if (!container) return;
    container.innerHTML = '';

    const calendarContainer = document.createElement('div');
    calendarContainer.classList.add('calendar-container');
    calendarContainer.innerHTML = `<h3>${month} 2025</h3>` + renderMonthCalendar(month, isAdmin, dayCheckState);

    container.appendChild(calendarContainer);

    attachDayCellListeners(month, container, isAdminView);
  }

  function attachDayCellListeners(month, calendarContainerElement, isAdminView) {
    if (!calendarContainerElement) return;
    const calendarContainer = calendarContainerElement.querySelector('.calendar-container');
    if (!calendarContainer) return;
    const dayCells = calendarContainer.querySelectorAll('.day-cell');

    dayCells.forEach(cell => {
      cell.addEventListener('click', () => {
        if (selectedDayCell) {
          selectedDayCell.classList.remove('selected');
        }

        cell.classList.add('selected');
        selectedDayCell = cell;

        const day = cell.dataset.day;
        if (isAdminView) {
          showDayDetails(month, day);
        } else {
          showVisitorDayDetails(month, day);
        }
      });

      if (isAdmin) {
        const checkbox = cell.querySelector('.checkbox-container input[type="checkbox"]');
        if (checkbox) {
          checkbox.addEventListener('change', (event) => {
            event.stopPropagation();
            const day = cell.closest('.day-cell').dataset.day;
            dayCheckState[`${month}-${day}`] = checkbox.checked;
            saveData();
            renderVisitorView();
          });
        }
      }
    });
  }

  function renderAdminCalendarView(month) {
    renderCalendarView(month, calendarViewContainer, true);
  }

  function renderVisitorCalendarView(month) {
    renderCalendarView(month, visitorCalendarViewContainer, false);
  }

  function renderVisitorView() {
    if (!visitorSection) return;
    visitorSection.style.display = 'flex';
    changeUserBtn.style.display = 'block';
    searchBtn.style.display = 'block';
    saveChangesBtn.style.display = 'none';

    const visibleMonths = Object.keys(monthVisibility).filter(month => monthVisibility[month]);
    renderMonthListForVisitor(visitorMonthListContainer, visibleMonths, renderVisitorCalendarView);

    if (currentMonth && monthVisibility[currentMonth]) {
      renderVisitorCalendarView(currentMonth);
    } else {
      visitorCalendarViewContainer.innerHTML = '<p>Seleccione un mes para ver el calendario.</p>';
    }

    Object.keys(monthVisibility).forEach(month => {
      if (monthVisibility[month]) {
      }
    });
  }

  function renderMonthListForVisitor(container, months, renderFunction) {
    if (!container) return;
    container.innerHTML = '';

    months.forEach(month => {
      const monthItem = document.createElement('div');
      monthItem.classList.add('month-list-item');

      const monthLabel = document.createElement('label');
      monthLabel.textContent = month;
      monthLabel.style.marginRight = '10px';

      monthItem.appendChild(monthLabel);

      monthItem.addEventListener('click', () => {
        currentMonth = month;
        renderFunction(month);
      });

      container.appendChild(monthItem);
    });
  }

  function showDayDetails(month, day) {
    if (!calendarViewContainer) return;
    const calendarContainer = calendarViewContainer.querySelector('.calendar-container');
    if (!dayDetailsContainer) return;
    dayDetailsContainer.style.display = 'block';

    const studentsForDay = studentData.filter(student => student.month === month && student.day === day);

    dayDetailsContainer.innerHTML = `
      <h3>${month} ${day}, 2025</h3>
      <p>Detalles para el día ${day} de ${month}.</p>
      <div>
        <button id="addStudentBtn">Agregar Estudiante</button>
        <div id="studentList">
          ${renderStudentList(studentsForDay)}
        </div>
      </div>
    `;

    calendarContainer.after(dayDetailsContainer);

    const addStudentBtn = document.getElementById('addStudentBtn');
    addStudentBtn.addEventListener('click', () => {
      showAddStudentModal(month, day);
    });
  }

  function renderStudentList(students) {
    if (!students || students.length === 0) {
      return '<p>No hay estudiantes registrados para este día.</p>';
    }

    return students.map((student, index) => `
      <div class="student-item">
        <div class="student-details">
          <div class="student-image-container">
            <img src="${student.imagen}" alt="${student.nombres}" class="student-image" onclick="openImageInFullScreen('${student.imagen}')">
          </div>
          <div class="student-info">
            <p><strong>${student.nombres} ${student.apellidos}</strong></p>
            <p>DNI: ${student.dni}</p>
            <p>Asunto: ${student.asunto}</p>
            <p>Grado: ${student.grado}</p>
            <p>Sección: ${student.seccion}</p>
            <p>Nivel: ${student.nivel}</p>
            <p>Mes: ${student.month}</p>
            <p>Día: ${student.day}</p>
          </div>
          <div class="student-actions">
            <button onclick="editStudent(${index})">Editar</button>
            <button onclick="deleteStudent(${index})">Eliminar</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.openImageInFullScreen = function(imageSrc) {
    const fullScreenContainer = document.createElement('div');
    fullScreenContainer.classList.add('fullscreen-image-container');
    fullScreenContainer.innerHTML = `
      <img src="${imageSrc}" alt="Imagen Completa" class="fullscreen-image">
    `;
    modalContent.style.maxWidth = '700px';
    modalContent.style.width = '70%';
    showModal(fullScreenContainer.innerHTML);
  };

  function showAddStudentModal(month, day) {
    const addStudentContent = `
      <div class="add-student-form">
        <h2>Agregar Estudiante</h2>
        <label for="dni">DNI:</label>
        <input type="text" id="dni" name="dni">
        <label for="nombres">Nombres:</label>
        <input type="text" id="nombres" name="nombres">
        <label for="apellidos">Apellidos:</label>
        <input type="text" id="apellidos" name="apellidos">
        <label for="asunto">Asunto:</label>
        <input type="text" id="asunto" name="asunto">
        <label for="grado">Grado:</label>
        <input type="text" id="grado" name="grado">
        <label for="seccion">Sección:</label>
        <input type="text" id="seccion" name="seccion">
        <label for="nivel">Nivel:</label>
        <select id="nivel" name="nivel">
          <option value="primaria">Primaria</option>
          <option value="secundaria">Secundaria</option>
        </select>
        <label for="imagen">Imagen:</label>
        <input type="file" id="imagen" name="imagen">
        <button id="registrarBtn">Registrar</button>
      </div>
    `;
    showModal(addStudentContent);

    const registrarBtn = document.getElementById('registrarBtn');
    registrarBtn.addEventListener('click', () => {
      const dni = document.getElementById('dni').value;
      const nombres = document.getElementById('nombres').value;
      const apellidos = document.getElementById('apellidos').value;
      const asunto = document.getElementById('asunto').value;
      const grado = document.getElementById('grado').value;
      const seccion = document.getElementById('seccion').value;
      const nivel = document.getElementById('nivel').value;
      const imagenInput = document.getElementById('imagen');
      const imagenFile = imagenInput.files[0];

      if (dni && nombres && apellidos && asunto && grado && seccion && nivel && imagenFile) {
        const reader = new FileReader();
        reader.onloadend = function() {
          const imagenBase64 = reader.result;

          const newStudent = {
            dni,
            nombres,
            apellidos,
            asunto,
            grado,
            seccion,
            nivel,
            imagen: imagenBase64,
            month,
            day
          };

          studentData.push(newStudent);
          saveData();
          closeModal();
          showDayDetails(month, day);
        }

        reader.readAsDataURL(imagenFile);
      } else {
        alert('Por favor, complete todos los campos.');
      }
    });

    window.previewImage = function(event) {
      const reader = new FileReader();
      reader.onload = function() {
        const preview = document.getElementById('imagePreview');
        preview.src = reader.result;
        preview.style.display = "block";
      }
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  window.editStudent = function(index) {
    const studentToEdit = studentData[index];
    const {
      dni,
      nombres,
      apellidos,
      asunto,
      grado,
      seccion,
      nivel,
      imagen,
      month,
      day
    } = studentToEdit;

    const editStudentContent = `
      <div class="add-student-form">
        <h2>Editar Estudiante</h2>
        <label for="dni">DNI:</label>
        <input type="text" id="dni" name="dni" value="${dni}">
        <label for="nombres">Nombres:</label>
        <input type="text" id="nombres" name="nombres" value="${nombres}">
        <label for="apellidos">Apellidos:</label>
        <input type="text" id="apellidos" name="apellidos" value="${apellidos}">
        <label for="asunto">Asunto:</label>
        <input type="text" id="asunto" name="asunto" value="${asunto}">
        <label for="grado">Grado:</label>
        <input type="text" id="grado" name="grado" value="${grado}">
        <label for="seccion">Sección:</label>
        <input type="text" id="seccion" name="seccion" value="${seccion}">
        <label for="nivel">Nivel:</label>
        <select id="nivel" name="nivel">
          <option value="primaria" ${nivel === 'primaria' ? 'selected' : ''}>Primaria</option>
          <option value="secundaria" ${nivel === 'secundaria' ? 'selected' : ''}>Secundaria</option>
        </select>
        <label for="imagen">Imagen:</label>
        <input type="file" id="imagen" name="imagen" accept="image/*" onchange="previewImage(event)">
        <img id="imagePreview" class="image-preview" src="${imagen}" alt="Vista previa de la imagen" style="display:block;">
        <button id="actualizarBtn">Actualizar</button>
      </div>
    `;

    showModal(editStudentContent);

    window.previewImage = function(event) {
      const reader = new FileReader();
      reader.onload = function() {
        const preview = document.getElementById('imagePreview');
        preview.src = reader.result;
        preview.style.display = "block";
      }
      reader.readAsDataURL(event.target.files[0]);
    }

    const actualizarBtn = document.getElementById('actualizarBtn');
    actualizarBtn.addEventListener('click', () => {
      const newDni = document.getElementById('dni').value;
      const newNombres = document.getElementById('nombres').value;
      const newApellidos = document.getElementById('apellidos').value;
      const newAsunto = document.getElementById('asunto').value;
      const newGrado = document.getElementById('grado').value;
      const newSeccion = document.getElementById('seccion').value;
      const newNivel = document.getElementById('nivel').value;
      const newImagenInput = document.getElementById('imagen');
      let newImagenFile = newImagenInput.files[0];

      if (!newImagenFile) {
        newImagenFile = imagen;
      }

      if (newDni && newNombres && newApellidos && newAsunto && newGrado && newSeccion && newNivel) {

        if (typeof newImagenFile === 'object' && newImagenFile !== null) {
          const reader = new FileReader();
          reader.onloadend = function() {
            const newImagenBase64 = reader.result;

            studentData[index] = {
              dni: newDni,
              nombres: newNombres,
              apellidos: newApellidos,
              asunto: newAsunto,
              grado: newGrado,
              seccion: newSeccion,
              nivel: newNivel,
              imagen: newImagenBase64,
              month,
              day
            };

            saveData();
            closeModal();
            showDayDetails(month, day);
          }

          reader.readAsDataURL(newImagenFile);
        } else {
          studentData[index] = {
            dni: newDni,
            nombres: newNombres,
            apellidos: newApellidos,
            asunto: newAsunto,
            grado: newGrado,
            seccion: newSeccion,
            nivel: newNivel,
            imagen: newImagenFile,
            month,
            day
          };

          saveData();
          closeModal();
          showDayDetails(month, day);
        }
      } else {
        alert('Por favor, complete todos los campos.');
      }
    });
  }

  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
      const adminLoginContent = `
        <div class="admin-login-form">
          <h2>Admin Login</h2>
          <label for="adminUsername">Username:</label>
          <input type="text" id="adminUsername" name="adminUsername" placeholder="Enter your username"><br>
          <label for="adminPassword">Password:</label>
          <input type="password" id="adminPassword" name="adminPassword" placeholder="Enter your password"><br>
          <button id="adminLoginSubmit">Iniciar Sesión</button>
        </div>
      `;
      showModal(adminLoginContent);

      const adminLoginSubmitBtn = document.getElementById('adminLoginSubmit');
      adminLoginSubmitBtn.addEventListener('click', () => {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        if (username === 'NeoDante97' && password === '123456789') {
          closeModal();
          loginSection.style.display = 'none';
          adminSection.style.display = 'block';
          changeUserBtn.style.display = 'block';
          searchBtn.style.display = 'block';
          saveChangesBtn.style.display = 'block';
          isAdmin = true;
          isVisitor = false;
          renderMonthList(monthListContainer, true, renderAdminCalendarView);
          renderVisitorView();
          visitorSection.style.display = 'none';
        } else {
          alert('Credenciales incorrectas.');
        }
      });
    });
  }

  if (visitorLoginBtn) {
    visitorLoginBtn.addEventListener('click', () => {
      loginSection.style.display = 'none';
      visitorSection.style.display = 'flex';
      changeUserBtn.style.display = 'block';
      searchBtn.style.display = 'block';
      saveChangesBtn.style.display = 'none';
      isAdmin = false;
      isVisitor = true;
      renderVisitorView();
    });
  }

  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
      const addUserContent = `
        <h2>Agregar Usuario</h2>
        <label for="dni">DNI:</label>
        <input type="text" id="dni" name="dni"><br><br>
        <label for="nombres">Nombres:</label>
        <input type="text" id="nombres" name="nombres"><br><br>
        <label for="apellidos">Apellidos:</label>
        <input type="text" id="apellidos" name="apellidos"><br><br>
        <label for="grado">Grado:</label>
        <input type="text" id="grado" name="grado"><br><br>
        <label for="seccion">Sección:</label>
        <input type="text" id="seccion" name="seccion"><br><br>
        <label for="nivel">Nivel:</label>
        <select id="nivel" name="nivel">
          <option value="primaria">Primaria</option>
          <option value="secundaria">Secundaria</option>
        </select><br><br>
        <label for="imagen">Imagen:</label>
        <input type="file" id="imagen" name="imagen"><br><br>
        <button id="registrarBtn">Registrar</button>
      `;
      showModal(addUserContent);

      const registrarBtn = document.getElementById('registrarBtn');
      registrarBtn.addEventListener('click', () => {
        const dni = document.getElementById('dni').value;
        const nombres = document.getElementById('nombres').value;
        const apellidos = document.getElementById('apellidos').value;
        const grado = document.getElementById('grado').value;
        const seccion = document.getElementById('seccion').value;
        const nivel = document.getElementById('nivel').value;
        const imagen = document.getElementById('imagen').value;

        if (dni && nombres && apellidos && grado && seccion && nivel && imagen) {
          if (!dni || !nombres || !apellidos || !grado || !seccion || !nivel || !imagen) {
            alert('Por favor, complete todos los campos.');
            return;
          }

          const newStudent = {
            dni,
            nombres,
            apellidos,
            grado,
            seccion,
            nivel,
            imagen,
            month: currentMonth,
            day: '1'
          };
          studentData.push(newStudent);
          saveData();
          alert('Usuario registrado correctamente.');
          closeModal();
        } else {
          alert('Falta llenar los datos.');
        }
      });
    });
  }

  let saveChangesMessage = document.createElement('div');
  saveChangesMessage.style.display = 'none';
  saveChangesMessage.style.position = 'fixed';
  saveChangesMessage.style.top = '20px';
  saveChangesMessage.style.left = '50%';
  saveChangesMessage.style.transform = 'translateX(-50%)';
  saveChangesMessage.style.backgroundColor = 'rgba(0, 123, 255, 0.8)';
  saveChangesMessage.style.color = 'white';
  saveChangesMessage.style.padding = '10px 20px';
  saveChangesMessage.style.borderRadius = '5px';
  saveChangesMessage.style.zIndex = '1001';
  saveChangesMessage.textContent = 'Cambios Guardados Correctamente!';
  document.body.appendChild(saveChangesMessage);

  if (saveChangesBtn) {
    saveChangesBtn.addEventListener('click', () => {
      saveData();
      saveChangesMessage.style.display = 'block';

      setTimeout(() => {
        saveChangesMessage.style.display = 'none';
      }, 3000);
    });
  }

  window.addEventListener('beforeunload', () => {
    saveData();
    saveChangesMessage.style.display = 'block';
  });

  function showVisitorDayDetails(month, day) {
    if (!visitorDayDetailsContainer) return;
    visitorDayDetailsContainer.style.display = 'block';
    const studentsForDay = studentData.filter(student => student.month === month && student.day === day);

    visitorDayDetailsContainer.innerHTML = `
      <h3>${month} ${day}, 2025</h3>
      <p>Detalles del día ${day} de ${month}.</p>
      <div>
        ${renderStudentListForVisitor(studentsForDay)}
      </div>
    `;

    if (visitorCalendarViewContainer) {
      const calendarContainer = visitorCalendarViewContainer.querySelector('.calendar-container');
      calendarContainer.after(visitorDayDetailsContainer);
    }
  }

  function renderStudentListForVisitor(students) {
    if (!students || students.length === 0) {
      return '<p>No hay estudiantes registrados para este día.</p>';
    }

    return students.map(student => `
      <div class="student-item">
        <div class="student-details">
          <div class="student-image-container">
            <img src="${student.imagen}" alt="${student.nombres}" class="student-image" onclick="openImageInFullScreen('${student.imagen}')">
          </div>
          <div class="student-info">
            <p><strong>${student.nombres} ${student.apellidos}</strong></p>
            <p>DNI: ${student.dni}</p>
            <p>Asunto: ${student.asunto}</p>
            <p>Grado: ${student.grado}</p>
            <p>Sección: ${student.seccion}</p>
            <p>Nivel: ${student.nivel}</p>
            <p>Mes: ${student.month}</p>
            <p>Día: ${student.day}</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderMonthList(monthListContainer, true, renderAdminCalendarView);

  function saveData() {
    localStorage.setItem('studentData', JSON.stringify(studentData));
    localStorage.setItem('monthVisibility', JSON.stringify(monthVisibility));
    localStorage.setItem('dayCheckState', JSON.stringify(dayCheckState));
  }

  renderVisitorView();
});