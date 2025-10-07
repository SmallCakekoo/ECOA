// Sidebar active state when navigating inside the catalog page
document.querySelectorAll('.menu-item').forEach((item)=>{
  item.addEventListener('click',()=>{
    document.querySelectorAll('.menu-item').forEach(i=>i.classList.remove('active'))
    item.classList.add('active')
  })
})

// Reset filters (visual only for mock)
const resetBtn = document.getElementById('resetFilters')
if(resetBtn){
  resetBtn.addEventListener('click',()=>{
    document.querySelectorAll('.filters select').forEach((s)=>{ s.selectedIndex = 0 })
  })
}

// Pagination highlight
document.querySelectorAll('.page-num').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.page-num').forEach(b=>b.classList.remove('active'))
    btn.classList.add('active')
  })
})

// Overlay logic
const openAddPlant = document.getElementById('openAddPlant')
const overlay = document.getElementById('addPlantOverlay')
const closeAddPlant = document.getElementById('closeAddPlant')

function openOverlay(){ overlay && overlay.classList.add('show') }
function closeOverlay(){ overlay && overlay.classList.remove('show') }

openAddPlant && openAddPlant.addEventListener('click', openOverlay)
closeAddPlant && closeAddPlant.addEventListener('click', closeOverlay)
overlay && overlay.addEventListener('click', (e)=>{ if(e.target === overlay) closeOverlay() })

// Photo preview inside overlay
const overlayUpload = document.getElementById('overlayUpload')
const overlayInput = document.getElementById('overlayPhotoInput')
const overlayPreview = document.getElementById('overlayPhotoPreview')

if(overlayUpload && overlayInput && overlayPreview){
  overlayUpload.addEventListener('click',()=> overlayInput.click())
  overlayInput.addEventListener('change',()=>{
    const file = overlayInput.files && overlayInput.files[0]
    if(!file) return
    const reader = new FileReader()
    reader.onload = (e)=>{
      overlayPreview.src = String(e.target && e.target.result || '')
      overlayPreview.style.display = 'block'
      const inner = overlayUpload.querySelector('.upload-inner')
      if(inner) inner.style.display = 'none'
    }
    reader.readAsDataURL(file)
  })
}

// Mock submit
const overlayPlantForm = document.getElementById('overlayPlantForm')
if(overlayPlantForm){
  overlayPlantForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    alert('Plant registered (demo)')
    closeOverlay()
  })
}


