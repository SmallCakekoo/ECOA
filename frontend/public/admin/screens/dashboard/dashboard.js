// Sidebar active state
document.querySelectorAll('.menu-item').forEach((item)=>{
  item.addEventListener('click',()=>{
    document.querySelectorAll('.menu-item').forEach(i=>i.classList.remove('active'))
    item.classList.add('active')
  })
})

// Upload preview
const uploadBox = document.getElementById('uploadBox')
const fileInput = document.getElementById('plantPhoto')
const preview = document.getElementById('photoPreview')

if(uploadBox && fileInput && preview){
  uploadBox.addEventListener('click',()=>fileInput.click())
  fileInput.addEventListener('change',()=>{
    const file = fileInput.files && fileInput.files[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = (e)=>{
      preview.src = String(e.target && e.target.result || '')
      preview.style.display = 'block'
      uploadBox.querySelector('.upload-inner').style.display = 'none'
    }
    reader.readAsDataURL(file)
  })
}

// Mock submit
const plantForm = document.getElementById('plantForm')
if(plantForm){
  plantForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    alert('Plant registered (demo)')
  })
}


