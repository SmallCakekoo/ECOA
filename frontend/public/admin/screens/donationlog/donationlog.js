// Sidebar active highlight
document.querySelectorAll('.menu-item').forEach((item)=>{
  item.addEventListener('click',()=>{
    document.querySelectorAll('.menu-item').forEach(i=>i.classList.remove('active'))
    item.classList.add('active')
  })
})

// Pagination highlight
document.querySelectorAll('.page-num').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.page-num').forEach(b=>b.classList.remove('active'))
    btn.classList.add('active')
  })
})

// Quick actions placeholders
document.querySelectorAll('.qa-item').forEach(btn=>{
  btn.addEventListener('click',()=>{
    alert('Feature coming soon (demo)')
  })
})


