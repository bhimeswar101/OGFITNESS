/* ==========================================================================
   OG FITNESS LUXURY JAVASCRIPT APPLICATION CODE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    /* ----------------------------------------------------------------------
       1. INITIALIZE LENIS SMOOTH SCROLL
       ---------------------------------------------------------------------- */
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate GSAP ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);


    /* ----------------------------------------------------------------------
       2. CUSTOM CURSOR
       ---------------------------------------------------------------------- */
    const cursor = document.querySelector(".custom-cursor");
    const follower = document.querySelector(".custom-cursor-follower");
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    
    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursor.style.left = mouseX + "px";
        cursor.style.top = mouseY + "px";
    });
    
    // Follower lag animation loop
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        
        follower.style.left = followerX + "px";
        follower.style.top = followerY + "px";
        
        requestAnimationFrame(animateFollower);
    }
    animateFollower();
    
    // Add hover states for interactive elements
    const hoverElements = document.querySelectorAll("a, button, input, select, textarea, .gym-3d-card, .gallery-item, .price-card, .schedule-btn, .calc-tab-btn, .option-card");
    
    hoverElements.forEach(el => {
        el.addEventListener("mouseenter", () => {
            document.body.classList.add("cursor-hover");
        });
        el.addEventListener("mouseleave", () => {
            document.body.classList.remove("cursor-hover");
        });
    });


    /* ----------------------------------------------------------------------
       3. INTRO LOADING SCREEN (CINEMATIC OPENING EXPERIENCE)
       ---------------------------------------------------------------------- */
    const loader = document.getElementById("loader");
    const loaderLine = document.querySelector(".loader-neon-line");
    
    // Fake loading bar progress
    setTimeout(() => {
        if(loaderLine) loaderLine.style.width = "100%";
    }, 100);
    
    const loaderTimeline = gsap.timeline();
    
    loaderTimeline
        .to(".loader-logo-container", {
            scale: 1.1,
            opacity: 1,
            duration: 1.5,
            ease: "power2.out"
        })
        .to(".loader-title", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.5")
        .to(".loader-subtitle", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.5")
        .to("#loader", {
            yPercent: -100,
            duration: 1.2,
            ease: "power4.inOut",
            delay: 1.2
        })
        .from(".navbar-container", {
            y: -50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        }, "-=0.2")
        .from(".hero-badge", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.8")
        .from(".hero-heading", {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power4.out"
        }, "-=0.7")
        .from(".hero-subheading", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.7")
        .from(".hero-buttons", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.7")
        .from(".hero-stats-grid", {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: "power3.out",
            onComplete: () => {
                // Initialize counters once hero is revealed
                startHeroCounters();
                if(loader) loader.style.display = "none";
            }
        }, "-=0.6");


    /* ----------------------------------------------------------------------
       4. SCROLL & NAVBAR ACTIONS
       ---------------------------------------------------------------------- */
    const navbar = document.getElementById("navbar");
    const progressBar = document.getElementById("scroll-progress-bar");
    
    window.addEventListener("scroll", () => {
        // Toggle sticky navbar background
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
        
        // Progress Scroll Bar
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if(progressBar) progressBar.style.width = scrolled + "%";
    });
    
    // Mobile Menu Toggle
    const mobileToggle = document.getElementById("mobile-toggle");
    const navMenu = document.getElementById("nav-menu");
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener("click", () => {
            mobileToggle.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
        
        // Close menu on link click
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                mobileToggle.classList.remove("active");
                navMenu.classList.remove("active");
            });
        });
    }

    // Active nav link tracking on scroll
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");
    
    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (pageYOffset >= sectionTop) {
                current = section.getAttribute("id");
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });


    /* ----------------------------------------------------------------------
       5. HERO STATISTICS COUNT-UP COUNTERS
       ---------------------------------------------------------------------- */
    function startHeroCounters() {
        const counters = document.querySelectorAll(".stat-number");
        counters.forEach(counter => {
            const target = +counter.getAttribute("data-target");
            const updateCount = () => {
                const count = +counter.innerText;
                const increment = Math.ceil(target / 80); // Speed factor
                
                if (count < target) {
                    counter.innerText = count + increment;
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }


    /* ----------------------------------------------------------------------
       6. INTERACTIVE 3D EXPERIENCE (DUMBBELL & TREADMILL)
       ---------------------------------------------------------------------- */
    const dbCard = document.getElementById("dumbbell-card");
    const dbObj = document.querySelector(".dumbbell-3d-object");
    const dbLight = dbCard ? dbCard.querySelector(".gym-3d-light") : null;
    
    if (dbCard && dbObj) {
        dbCard.addEventListener("mousemove", (e) => {
            const rect = dbCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            
            // Generate tilt metrics
            const tiltX = ((yc - y) / yc) * 20; // Max tilt 20 degrees
            const tiltY = ((x - xc) / xc) * 20;
            
            dbObj.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(40px)`;
            if(dbLight) {
                dbLight.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.15) 0%, rgba(255,255,255,0) 60%)`;
            }
        });
        
        dbCard.addEventListener("mouseleave", () => {
            dbObj.style.transform = `rotateX(-15deg) rotateY(30deg) translateZ(0px)`;
            if(dbLight) {
                dbLight.style.background = `radial-gradient(circle at 0px 0px, rgba(255, 255, 255, 0.15) 0%, rgba(255,255,255,0) 50%)`;
            }
        });
    }
    
    // Treadmill interactive console metrics
    const btnSpeedUp = document.getElementById("btn-speed-up");
    const btnSpeedDown = document.getElementById("btn-speed-down");
    const displaySpeed = document.getElementById("treadmill-speed");
    const displayIncline = document.getElementById("treadmill-incline");
    const displayHr = document.getElementById("treadmill-hr");
    
    if(btnSpeedUp && btnSpeedDown && displaySpeed) {
        btnSpeedUp.addEventListener("click", () => {
            let currentSpeed = parseFloat(displaySpeed.innerText);
            let currentIncline = parseFloat(displayIncline.innerText);
            
            if (currentSpeed < 22) {
                currentSpeed = (currentSpeed + 0.5).toFixed(1);
                currentIncline = Math.min(15, parseFloat((currentIncline + 0.3).toFixed(1)));
                displaySpeed.innerText = currentSpeed;
                displayIncline.innerText = currentIncline.toFixed(1);
                
                // Calculate dynamic heart rate output
                displayHr.innerText = Math.round(80 + (currentSpeed * 7) + (currentIncline * 3));
            }
        });
        
        btnSpeedDown.addEventListener("click", () => {
            let currentSpeed = parseFloat(displaySpeed.innerText);
            let currentIncline = parseFloat(displayIncline.innerText);
            
            if (currentSpeed > 1) {
                currentSpeed = (currentSpeed - 0.5).toFixed(1);
                currentIncline = Math.max(0, parseFloat((currentIncline - 0.3).toFixed(1)));
                displaySpeed.innerText = currentSpeed;
                displayIncline.innerText = currentIncline.toFixed(1);
                
                displayHr.innerText = Math.round(80 + (currentSpeed * 7) + (currentIncline * 3));
            }
        });
    }


    /* ----------------------------------------------------------------------
       7. DYNAMIC PARTICLES ENGINE (HERO BG)
       ---------------------------------------------------------------------- */
    if (document.getElementById("particles-js")) {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": "#E10600" },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.25, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.1, "sync": false } },
                "size": { "value": 3, "random": true, "anim": { "enable": false } },
                "line_linked": { "enable": true, "distance": 150, "color": "#E10600", "opacity": 0.15, "width": 1 },
                "move": { "enable": true, "speed": 2.5, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": false } },
                "modes": { "grab": { "distance": 180, "line_linked": { "opacity": 0.35 } } }
            },
            "retina_detect": true
        });
    }


    /* ----------------------------------------------------------------------
       8. PARALLAX EFFECT ON SCROLL
       ---------------------------------------------------------------------- */
    const parallaxContainers = document.querySelectorAll(".parallax-container");
    
    window.addEventListener("scroll", () => {
        parallaxContainers.forEach(container => {
            const img = container.querySelector(".parallax-img");
            if(img) {
                const containerRect = container.getBoundingClientRect();
                const containerTop = containerRect.top;
                const windowHeight = window.innerHeight;
                
                if (containerTop < windowHeight && containerRect.bottom > 0) {
                    const scrollPercent = (windowHeight - containerTop) / (windowHeight + containerRect.height);
                    // Move image slightly up/down based on scroll percentage
                    const translateY = (scrollPercent - 0.5) * 50; // max shift 25px up or down
                    img.style.transform = `scale(1.1) translateY(${translateY}px)`;
                }
            }
        });
    });


    /* ----------------------------------------------------------------------
       9. CLIENT TRANSFORMATION COMPARISON SLIDER
       ---------------------------------------------------------------------- */
    const compSlider = document.getElementById("comp-slider");
    const afterImgContainer = document.getElementById("after-img-container");
    const sliderHandle = document.getElementById("slider-handle");
    
    if (compSlider && afterImgContainer && sliderHandle) {
        let isDragging = false;
        
        function updateSlider(clientX) {
            const rect = compSlider.getBoundingClientRect();
            let position = clientX - rect.left;
            
            // Constrain
            if (position < 0) position = 0;
            if (position > rect.width) position = rect.width;
            
            const percent = (position / rect.width) * 100;
            afterImgContainer.style.width = percent + "%";
            sliderHandle.style.left = percent + "%";
        }
        
        sliderHandle.addEventListener("mousedown", () => {
            isDragging = true;
        });
        
        window.addEventListener("mouseup", () => {
            isDragging = false;
        });
        
        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            updateSlider(e.clientX);
        });
        
        // Touch supports
        sliderHandle.addEventListener("touchstart", () => {
            isDragging = true;
        });
        
        window.addEventListener("touchend", () => {
            isDragging = false;
        });
        
        window.addEventListener("touchmove", (e) => {
            if (!isDragging) return;
            if (e.touches && e.touches[0]) {
                updateSlider(e.touches[0].clientX);
            }
        });
    }


    /* ----------------------------------------------------------------------
       10. CLIENT TRANSFORMATION PROGRESS TRACKER WIDGET
       ---------------------------------------------------------------------- */
    const btnTrack = document.getElementById("btn-calculate-progress");
    const trackCurrent = document.getElementById("track-current-weight");
    const trackTarget = document.getElementById("track-target-weight");
    const trackerMsg = document.getElementById("tracker-result-msg");
    const trackerBarContainer = document.querySelector(".tracker-progress-bar-container");
    const trackerBar = document.getElementById("tracker-progress-bar");
    
    // Load local storage weights if exists
    if(trackCurrent && trackTarget) {
        const savedCurrent = localStorage.getItem("og_current_weight");
        const savedTarget = localStorage.getItem("og_target_weight");
        if(savedCurrent) trackCurrent.value = savedCurrent;
        if(savedTarget) trackTarget.value = savedTarget;
        
        if (savedCurrent && savedTarget) {
            calculateWeightProgress(parseFloat(savedCurrent), parseFloat(savedTarget));
        }
    }
    
    if(btnTrack) {
        btnTrack.addEventListener("click", () => {
            const currentVal = parseFloat(trackCurrent.value);
            const targetVal = parseFloat(trackTarget.value);
            
            if (isNaN(currentVal) || isNaN(targetVal) || currentVal <= 0 || targetVal <= 0) {
                trackerMsg.innerText = "Please input valid weights.";
                trackerMsg.style.color = "#E10600";
                return;
            }
            
            // Save to localStorage
            localStorage.setItem("og_current_weight", currentVal);
            localStorage.setItem("og_target_weight", targetVal);
            
            calculateWeightProgress(currentVal, targetVal);
        });
    }
    
    function calculateWeightProgress(current, target) {
        trackerBarContainer.style.display = "block";
        const diff = Math.abs(current - target);
        
        if(current === target) {
            trackerBar.style.width = "100%";
            trackerMsg.innerText = "Goal achieved! Excellent work, OG!";
            trackerMsg.style.color = "#22c55e";
            return;
        }
        
        // Progress representation out of 10kg average block
        let progress = 100 - (diff * 8); // simple visual progress simulation
        if (progress < 10) progress = 15; // default minimum bar
        if (progress > 100) progress = 95;
        
        trackerBar.style.width = progress + "%";
        trackerMsg.innerText = `You are ${diff.toFixed(1)}kg away from your target. Keep pushing!`;
        trackerMsg.style.color = "#A3A3A3";
    }


    /* ----------------------------------------------------------------------
       11. BIOMETRIC CALCULATORS MODULE
       ---------------------------------------------------------------------- */
    const tabBtns = document.querySelectorAll(".calc-tab-btn");
    const panels = document.querySelectorAll(".calc-panel");
    
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            const targetTab = btn.getAttribute("data-tab");
            document.getElementById(`calc-${targetTab}`).classList.add("active");
        });
    });
    
    // BMI Logic
    const btnBmi = document.getElementById("btn-calc-bmi");
    if(btnBmi) {
        btnBmi.addEventListener("click", () => {
            const weight = parseFloat(document.getElementById("bmi-weight").value);
            const height = parseFloat(document.getElementById("bmi-height").value);
            
            if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) return;
            
            const heightM = height / 100;
            const bmi = (weight / (heightM * heightM)).toFixed(1);
            
            const bmiVal = document.getElementById("bmi-result-val");
            const bmiCat = document.getElementById("bmi-result-cat");
            const markers = document.querySelectorAll(".bmi-range-visual .marker");
            
            bmiVal.innerText = bmi;
            
            // Categories and colors
            markers.forEach(m => m.classList.remove("active"));
            if (bmi < 18.5) {
                bmiCat.innerText = "UNDERWEIGHT";
                bmiCat.style.color = "#38bdf8";
                document.querySelector(".marker.underweight").classList.add("active");
            } else if (bmi >= 18.5 && bmi < 25) {
                bmiCat.innerText = "NORMAL";
                bmiCat.style.color = "#22c55e";
                document.querySelector(".marker.normal").classList.add("active");
            } else if (bmi >= 25 && bmi < 30) {
                bmiCat.innerText = "OVERWEIGHT";
                bmiCat.style.color = "#eab308";
                document.querySelector(".marker.overweight").classList.add("active");
            } else {
                bmiCat.innerText = "OBESE";
                bmiCat.style.color = "#E10600";
                document.querySelector(".marker.obese").classList.add("active");
            }
        });
    }
    
    // BMR Logic
    const btnBmr = document.getElementById("btn-calc-bmr");
    if(btnBmr) {
        btnBmr.addEventListener("click", () => {
            const gender = document.getElementById("bmr-gender").value;
            const weight = parseFloat(document.getElementById("bmr-weight").value);
            const height = parseFloat(document.getElementById("bmr-height").value);
            const age = parseInt(document.getElementById("bmr-age").value);
            const activity = parseFloat(document.getElementById("bmr-activity").value);
            
            if (isNaN(weight) || isNaN(height) || isNaN(age)) return;
            
            let bmr = 0;
            if (gender === "male") {
                bmr = 10 * weight + 6.25 * height - 5 * age + 5;
            } else {
                bmr = 10 * weight + 6.25 * height - 5 * age - 161;
            }
            
            const tdee = bmr * activity;
            
            document.getElementById("bmr-val").innerText = Math.round(bmr).toLocaleString();
            document.getElementById("tdee-val").innerText = Math.round(tdee).toLocaleString();
        });
    }
    
    // Water Intake Logic
    const btnWater = document.getElementById("btn-calc-water");
    if(btnWater) {
        btnWater.addEventListener("click", () => {
            const weight = parseFloat(document.getElementById("water-weight").value);
            const exercise = parseFloat(document.getElementById("water-exercise").value);
            
            if (isNaN(weight) || isNaN(exercise)) return;
            
            // Math: Weight in kg * 0.033 + (exercise minutes / 30) * 0.35
            const waterL = (weight * 0.033) + ((exercise / 30) * 0.35);
            const glasses = Math.round(waterL * 4); // 250ml glasses
            
            document.getElementById("water-val").innerText = waterL.toFixed(1);
            document.getElementById("water-glasses").innerText = glasses;
        });
    }
    
    // Protein Logic
    const btnProtein = document.getElementById("btn-calc-protein");
    if(btnProtein) {
        btnProtein.addEventListener("click", () => {
            const weight = parseFloat(document.getElementById("protein-weight").value);
            const multiplier = parseFloat(document.getElementById("protein-goal").value);
            
            if (isNaN(weight)) return;
            
            const proteinG = Math.round(weight * multiplier);
            const eggWhites = Math.round(proteinG / 6); // 6g per egg white
            const chickenG = Math.round((proteinG / 25) * 100); // 25g protein per 100g chicken
            
            document.getElementById("protein-val").innerText = proteinG;
            document.getElementById("protein-eggs").innerText = eggWhites;
            document.getElementById("protein-chicken").innerText = chickenG + "g";
        });
    }


    /* ----------------------------------------------------------------------
       12. WORKOUT WEEKLY SCHEDULE TAB SWITCHER
       ---------------------------------------------------------------------- */
    const schedBtns = document.querySelectorAll(".schedule-btn");
    const schedPanels = document.querySelectorAll(".schedule-panel");
    
    schedBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            schedBtns.forEach(b => b.classList.remove("active"));
            schedPanels.forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            const day = btn.getAttribute("data-day");
            document.getElementById(`sched-${day}`).classList.add("active");
        });
    });


    /* ----------------------------------------------------------------------
       13. GALLERY MASONRY FILTER & LIGHTBOX
       ---------------------------------------------------------------------- */
    const filterBtns = document.querySelectorAll(".filter-btn");
    const galleryItems = document.querySelectorAll(".gallery-item");
    
    filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            filterBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const filter = btn.getAttribute("data-filter");
            
            galleryItems.forEach(item => {
                const category = item.getAttribute("data-category");
                if (filter === "all" || filter === category) {
                    item.style.display = "block";
                    gsap.fromTo(item, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 });
                } else {
                    item.style.display = "none";
                }
            });
        });
    });
    
    // Lightbox Module
    const lightbox = document.getElementById("gallery-lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.getElementById("lightbox-close");
    const lightboxCaption = document.getElementById("lightbox-caption");
    
    if(galleryItems.length > 0 && lightbox) {
        galleryItems.forEach(item => {
            item.addEventListener("click", () => {
                const imgSrc = item.querySelector("img").src;
                const captionText = item.querySelector("h4").innerText;
                
                lightboxImg.src = imgSrc;
                lightboxCaption.innerText = captionText;
                lightbox.style.display = "block";
                document.body.style.overflow = "hidden"; // disable body scrolls
            });
        });
        
        lightboxClose.addEventListener("click", () => {
            lightbox.style.display = "none";
            document.body.style.overflow = "auto";
        });
        
        lightbox.addEventListener("click", (e) => {
            if(e.target === lightbox) {
                lightbox.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
    }


    /* ----------------------------------------------------------------------
       14. CONTACT FORM & NEWSLETTER
       ---------------------------------------------------------------------- */
    const contactForm = document.getElementById("fitness-contact-form");
    const formStatusMsg = document.getElementById("contact-form-status-msg");
    
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const name = document.getElementById("contact-name").value.trim();
            const mobile = document.getElementById("contact-mobile").value.trim();
            const goal = document.getElementById("contact-goal").value;
            const message = document.getElementById("contact-message").value.trim();
            
            formStatusMsg.innerText = `Processing Registration, ${name}...`;
            formStatusMsg.style.color = "#FFFFFF";
            
            fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, mobile, goal, message })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    if (data.useFallbackRedirect) {
                        formStatusMsg.innerText = "Registration Successful! Redirecting to WhatsApp to claim your Elite Pass...";
                        formStatusMsg.style.color = "#22c55e";
                        
                        const textMsg = `Hey what's up! I just registered for the 1-Day Elite Pass on your website. My details:\nName: ${name}\nGoal: ${goal}\nMessage: ${message}\nPlease send me my Elite Pass!`;
                        const encodedText = encodeURIComponent(textMsg);
                        
                        setTimeout(() => {
                            window.open(`https://wa.me/917222853999?text=${encodedText}`, '_blank');
                            contactForm.reset();
                            formStatusMsg.innerText = "Registration Successful! Pass requested on WhatsApp.";
                            setTimeout(() => { formStatusMsg.innerText = ""; }, 5000);
                        }, 1500);
                    } else {
                        formStatusMsg.innerText = "Registration Successful! Your 1-Day Elite Pass has been sent to your WhatsApp number.";
                        formStatusMsg.style.color = "#22c55e";
                        contactForm.reset();
                        setTimeout(() => { formStatusMsg.innerText = ""; }, 5000);
                    }
                } else {
                    formStatusMsg.innerText = "Registration failed. Please try again.";
                    formStatusMsg.style.color = "#E10600";
                }
            })
            .catch(err => {
                console.error("Registration error:", err);
                formStatusMsg.innerText = "Connection error. Redirecting to WhatsApp fallback...";
                formStatusMsg.style.color = "#eab308";
                
                const textMsg = `Hey what's up! I just registered for the 1-Day Elite Pass on your website. My details:\nName: ${name}\nGoal: ${goal}\nMessage: ${message}\nPlease send me my Elite Pass!`;
                const encodedText = encodeURIComponent(textMsg);
                
                setTimeout(() => {
                    window.open(`https://wa.me/917222853999?text=${encodedText}`, '_blank');
                    contactForm.reset();
                    formStatusMsg.innerText = "Registration Successful! Pass requested on WhatsApp.";
                    setTimeout(() => { formStatusMsg.innerText = ""; }, 5000);
                }, 1500);
            });
        });
    }
    
    // Newsletter Submit
    const newsletterForm = document.getElementById("newsletter-form");
    const newsletterStatus = document.getElementById("newsletter-status");
    
    if(newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector("input[type='email']");
            const subscriberEmail = emailInput ? emailInput.value.trim() : "";
            
            newsletterStatus.innerText = "Subscribing...";
            newsletterStatus.style.color = "#FFFFFF";
            
            if (subscriberEmail) {
                fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: subscriberEmail })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        newsletterStatus.innerText = "Subscribed successfully! Welcome email sent.";
                        newsletterStatus.style.color = "#22c55e";
                    } else {
                        newsletterStatus.innerText = "Subscribed successfully!";
                        newsletterStatus.style.color = "#22c55e";
                    }
                    newsletterForm.reset();
                    setTimeout(() => { newsletterStatus.innerText = ""; }, 5000);
                })
                .catch(err => {
                    console.error("Email send error:", err);
                    newsletterStatus.innerText = "Subscribed successfully!";
                    newsletterStatus.style.color = "#22c55e";
                    newsletterForm.reset();
                    setTimeout(() => { newsletterStatus.innerText = ""; }, 5000);
                });
            } else {
                newsletterStatus.innerText = "Please provide a valid email.";
                newsletterStatus.style.color = "#E10600";
            }
        });
    }


    /* ----------------------------------------------------------------------
       15. SIMULATED AI FITNESS CHATBOT ENGINE (OG BOT)
       ---------------------------------------------------------------------- */
    const chatToggle = document.getElementById("chatbot-toggle");
    const chatPanel = document.getElementById("chatbot-panel");
    const chatClose = document.getElementById("chat-close");
    const chatMessages = document.getElementById("chat-messages");
    const chatInputForm = document.getElementById("chat-input-form");
    const chatUserMsg = document.getElementById("chat-user-msg");
    const notifBadge = document.querySelector(".bubble-notification");

    // Local knowledge base (Trained fitness and schedule details)
    const localReplies = {
        greetings: {
            keywords: ["hello", "hi", "hey", "hola", "greetings", "good morning", "good afternoon", "good evening", "yo", "sup", "name", "who are you"],
            response: "Hello OG! Welcome to <strong>OG FITNESS</strong>. I am the <strong>OG Bot</strong>, your digital fitness coach. How can I help you dominate your targets today?<br><br>Ask me about our <strong>workout schedules</strong>, <strong>membership rates</strong>, <strong>locations</strong>, <strong>diet tips</strong>, or ask me to <strong>calculate your BMI, Water, or Protein</strong>!"
        },
        hours: {
            keywords: ["hour", "time", "timing", "open", "close", "sunday", "schedule", "days", "timings"],
            response: "Our luxury fitness floor is open <strong>Monday to Saturday from 5:00 AM to 10:00 PM</strong>.<br><br><strong>Sundays are closed</strong> for active recovery, deep muscle repair, and facility sanitization. Recovery is when the muscle actually grows, OG!"
        },
        location: {
            keywords: ["location", "address", "where", "landmark", "city", "vijayawada", "ap", "andhra", "map", "locate"],
            response: "<strong>OG FITNESS</strong> is situated in the premium hub of <strong>Vijayawada, Andhra Pradesh, India</strong>.<br><br>Our facility features dedicated parking spaces, highly filtered central cooling (HEPA standards), luxury steam rooms, and a VIP lounge. Visit the Contact section on our page for more details!"
        },
        prices: {
            keywords: ["price", "membership", "fee", "cost", "package", "basic", "premium", "elite", "join", "subscription", "prices"],
            response: "We offer three exclusive membership tiers:<br><table><tr><th>Plan</th><th>Monthly Fee</th><th>Key Benefit</th></tr><tr><td><strong>Basic</strong></td><td>₹2,499</td><td>Full floor access & locker</td></tr><tr><td><strong>Premium</strong></td><td>₹4,499</td><td>Group classes & towel service</td></tr><tr><td><strong>Elite</strong></td><td>₹7,999</td><td>1-on-1 coach, customized diet</td></tr></table><br>All Elite packages include daily biometric reviews. Scroll to our <strong>Membership Matrix</strong> section for a full comparison of benefits!"
        },
        trial: {
            keywords: ["trial", "book", "pass", "free", "visit", "register", "pass"],
            response: "You can experience our luxury floor with a <strong>Free 1-Day Elite Trial Pass</strong>!<br><br>To register, simply fill out the form in the <strong>Contact Section</strong> on our site, or type your <strong>Name and Mobile Number</strong> here, and our desk team will whitelist your entrance."
        },
        trainers: {
            keywords: ["trainer", "coach", "vikram", "priya", "arjun", "personal training", "pt", "coaching", "trainers", "coaches"],
            response: "Our elite trainers are globally certified (ISSA, ACE, NASM):<br><ul><li><strong>Coach Vikram Singh</strong>: Strength, Powerlifting & Biomechanics.</li><li><strong>Coach Priya Sharma</strong>: CrossFit Conditioning, HIIT & Cardiovascular Endurance.</li><li><strong>Coach Arjun Rao</strong>: Performance Nutrition, Hypertrophy Splits & Lifestyle Coaching.</li></ul><br>Personalized coaching is included in our signature <strong>Elite Plan</strong>. Ask me about a specific coach's name to view their schedule!"
        },
        workouts: {
            keywords: ["workout", "exercise", "routine", "split", "chest", "back", "leg", "shoulders", "cardio", "hiit", "crossfit", "split"],
            response: "We recommend a scientific weekly muscle split for maximum recovery:<br><ul><li><strong>Monday/Thursday</strong>: Push Day (Chest, Shoulders, Triceps)</li><li><strong>Tuesday/Friday</strong>: Pull Day (Back, Lats, Biceps)</li><li><strong>Wednesday/Saturday</strong>: Legs & Core / Functional CrossFit</li><li><strong>Sunday</strong>: Absolute Rest & Recovery</li></ul><br>Check out our interactive <strong>Workout Scheduler</strong> on the page to view hourly group training sessions."
        },
        nutrition: {
            keywords: ["diet", "nutrition", "eat", "meal", "food", "veg", "vegetarian", "non-veg", "protein source", "carb", "fat"],
            response: "Nutrition is 70% of your transformation! Here are high-quality protein sources:<br><ul><li><strong>Non-Vegetarian</strong>: Chicken Breast (31g/100g), Whole Eggs (6g per egg), Fish (25g/100g)</li><li><strong>Vegetarian</strong>: Paneer (18g/100g), Soya Chunks (52g/100g), Greek Yogurt (10g/100g), Lentils & Tofu</li></ul><br>To get a fully tailored nutrition macro sheet, consider subscribing to our <strong>Elite Package</strong>."
        },
        supplements: {
            keywords: ["supplement", "creatine", "whey", "pre-workout", "bcaa", "glutamine", "multivitamin", "supplements"],
            response: "Supplements help fill nutritional gaps, OG:<br><ul><li><strong>Whey Protein</strong>: Post-workout for rapid muscle protein synthesis.</li><li><strong>Creatine Monohydrate</strong>: 3-5g daily for ATP regeneration, explosive power, and cellular hydration.</li><li><strong>Pre-Workout</strong>: L-Citrulline & Caffeine for pumps, endurance, and focus.</li></ul><br>Always prioritize whole foods before supplements!"
        },
        progressive_overload: {
            keywords: ["progressive", "overload", "rep", "weight", "set", "lift", "heavy", "stuck"],
            response: "<strong>Progressive Overload</strong> is the key to muscle growth! You must challenge your muscles over time by:<br><ul><li>Increasing the weight lifted.</li><li>Increasing reps per set.</li><li>Increasing total sets per workout.</li><li>Reducing rest times between sets.</li></ul><br>Focus on keeping a detailed workout log and aim to beat your previous performance by 1 rep or 0.5kg each week."
        },
        cut_bulk: {
            keywords: ["bulk", "cut", "gain weight", "lose weight", "deficit", "surplus", "lean"],
            response: "Here are the primary transformation pathways:<br><ul><li><strong>Bulking (Muscle Gain)</strong>: Consume a calorie surplus of 200-500 calories above maintenance, train heavy, and prioritize 2.0g of protein per kg of body weight.</li><li><strong>Cutting (Fat Loss)</strong>: Consume a calorie deficit of 300-500 calories below maintenance, maintain lifting intensity to preserve muscle, and increase protein to 1.6-1.8g per kg.</li></ul>"
        },
        rest_time: {
            keywords: ["rest", "sleep", "recovery", "between sets", "seconds", "minutes"],
            response: "Scientific rest targets for performance:<br><ul><li><strong>Strength Lift (Squat/Deadlift)</strong>: Rest 3 to 5 minutes between heavy sets.</li><li><strong>Hypertrophy (DB Press/Rows)</strong>: Rest 90 to 120 seconds.</li><li><strong>Isolation (Curls/Raises)</strong>: Rest 60 to 90 seconds.</li><li><strong>Sleep</strong>: Aim for 7 to 9 hours of quality sleep daily for nervous system restoration.</li></ul>"
        },
        equipment: {
            keywords: ["equipment", "machine", "barbell", "dumbbell", "weights", "treadmill", "gear", "machines"],
            response: "We feature high-end imported equipment:<br><ul><li>Precision biomechanic plate-loaded machines.</li><li>Custom-welded heavy-duty power cages & lifting platforms.</li><li>Vibration-damped dumbbells ranging up to 60kg.</li><li>Console-connected treadmills with incline controls and heart-rate tracking.</li></ul>"
        },
        facilities: {
            keywords: ["facility", "ventilation", "shower", "locker", "music", "shake bar", "steam", "amenities"],
            response: "OG FITNESS is a luxury club. Our facility features:<br><ul><li>Luxury locker rooms with digital locks & private changing pods.</li><li>Steam rooms for optimal post-workout recovery.</li><li>A specialized Protein Shake Bar serving fresh macro-calculated shakes.</li><li>Central HEPA air filtration & high-energy surround sound systems.</li></ul>"
        },
        help: {
            keywords: ["help", "menu", "option", "what can you do", "commands", "question"],
            response: "I can answer any gym-related questions and perform interactive calculations! Try asking me:<br><ul><li><em>'Where is the gym located?'</em></li><li><em>'What are the membership prices?'</em></li><li><em>'Show me Monday schedule'</em></li><li><em>'When is Coach Priya teaching?'</em></li><li><em>'Calculate BMR: 75kg, 180cm, 28yo, male, moderate activity'</em></li><li><em>'What is my protein goal for 80kg weight loss?'</em></li></ul>"
        }
    };

    // Regex biometric extractor
    function extractBiometrics(text) {
        const query = text.toLowerCase();
        
        let weight = null;
        const weightMatch = query.match(/\b(?:weight|wt|weighs?)\b\s*(?:is|of)?\s*(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilograms|lbs)?/i) 
                          || query.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilograms)/i);
        if (weightMatch) {
            let val = parseFloat(weightMatch[1]);
            if (query.includes("lbs") || query.includes("pounds")) {
                val = val * 0.453592;
            }
            weight = val;
        }

        let height = null;
        const heightMatch = query.match(/\b(?:height|ht|tall)\b\s*(?:is|of)?\s*(\d+(?:\.\d+)?)\s*(?:cm|cms|centimeters|meters|m)?/i)
                          || query.match(/(\d+(?:\.\d+)?)\s*(?:cm|cms|centimeters)/i);
        if (heightMatch) {
            let val = parseFloat(heightMatch[1]);
            if (val < 3) {
                val = val * 100;
            }
            height = val;
        } else {
            const ftInMatch = query.match(/(\d+)\s*(?:feet|ft|'|foot)\s*(?:(\d+)\s*(?:inches|in|"))?/i);
            if (ftInMatch) {
                const ft = parseInt(ftInMatch[1]);
                const inch = parseInt(ftInMatch[2] || 0);
                height = (ft * 30.48) + (inch * 2.54);
            }
        }

        let age = null;
        const ageMatch = query.match(/(?:age|old|yrs)\s*(?:is|of)?\s*(\d+)/i) || query.match(/(\d+)\s*(?:years|yrs|yo)/i);
        if (ageMatch) age = parseInt(ageMatch[1]);

        let gender = "male";
        if (query.includes("female") || query.includes("woman") || query.includes("girl") || query.includes("she")) {
            gender = "female";
        }

        let activity = 1.375;
        if (query.includes("sedentary") || query.includes("no workout") || query.includes("sit all day")) activity = 1.2;
        if (query.includes("moderate") || query.includes("active 3") || query.includes("active 4")) activity = 1.55;
        if (query.includes("very active") || query.includes("athlete") || query.includes("workout daily") || query.includes("hard training")) activity = 1.725;

        let exercise = 60;
        const exerciseMatch = query.match(/(\d+)\s*(?:min|mins|minutes|hrs|hours)\s*(?:workout|exercise|training|run)/i);
        if (exerciseMatch) {
            exercise = parseInt(exerciseMatch[1]);
            if (query.includes("hr") || query.includes("hour")) exercise = exercise * 60;
        }

        return { weight, height, age, gender, activity, exercise };
    }

    // Local decision matrix (Schedule calculations and local Q&A routing)
    function getLocalResponse(query) {
        const cleanQuery = query.toLowerCase();
        const biometrics = extractBiometrics(cleanQuery);
        
        // 1. Weekly Schedule Handlers
        if (cleanQuery.includes("monday") || cleanQuery.includes("mon ")) {
            return `
                <p>Here is the <strong>Monday Power & Conditioning Split</strong>:</p>
                <table>
                    <tr><th>Time</th><th>Class</th><th>Coach</th></tr>
                    <tr><td>06:00 AM - 08:00 AM</td><td><strong>Chest & Triceps Power Split</strong> (High Intensity)</td><td>Coach Vikram</td></tr>
                    <tr><td>10:00 AM - 11:30 AM</td><td><strong>Cardio Metabolic Conditioning</strong> (Med Intensity)</td><td>Coach Priya</td></tr>
                    <tr><td>06:00 PM - 08:00 PM</td><td><strong>Chest & Triceps Hypertrophy</strong> (High Intensity)</td><td>Coach Arjun</td></tr>
                </table>
                <p>Focus: Heavy pushing splits and metabolic conditioning intervals.</p>
            `;
        }
        if (cleanQuery.includes("tuesday") || cleanQuery.includes("tue ")) {
            return `
                <p>Here is the <strong>Tuesday Posterior Split</strong>:</p>
                <table>
                    <tr><th>Time</th><th>Class</th><th>Coach</th></tr>
                    <tr><td>06:00 AM - 08:00 AM</td><td><strong>Back & Biceps Pull Split</strong> (High Intensity)</td><td>Coach Vikram</td></tr>
                    <tr><td>05:30 PM - 06:30 PM</td><td><strong>Dynamic CrossFit WOD</strong> (Extreme)</td><td>Coach Priya</td></tr>
                    <tr><td>07:00 PM - 08:30 PM</td><td><strong>Biceps & Lats Volumizer</strong> (Med Intensity)</td><td>Coach Arjun</td></tr>
                </table>
                <p>Focus: Heavy deadlifts, lat width, and metabolic group work.</p>
            `;
        }
        if (cleanQuery.includes("wednesday") || cleanQuery.includes("wed ")) {
            return `
                <p>Here is the <strong>Wednesday Core & Cardio Split</strong>:</p>
                <table>
                    <tr><th>Time</th><th>Class</th><th>Coach</th></tr>
                    <tr><td>07:00 AM - 08:30 AM</td><td><strong>Active Mobility & Core Stability</strong> (Low Intensity)</td><td>Coach Arjun</td></tr>
                    <tr><td>06:00 PM - 07:30 PM</td><td><strong>High Intensity Interval Training (HIIT)</strong> (High Intensity)</td><td>Coach Priya</td></tr>
                </table>
                <p>Focus: Core restoration, active stretching, and speed fat burns.</p>
            `;
        }
        if (cleanQuery.includes("thursday") || cleanQuery.includes("thu ")) {
            return `
                <p>Here is the <strong>Thursday Structural Split</strong>:</p>
                <table>
                    <tr><th>Time</th><th>Class</th><th>Coach</th></tr>
                    <tr><td>06:00 AM - 08:00 AM</td><td><strong>Shoulders & Arms Blast</strong> (High Intensity)</td><td>Coach Vikram</td></tr>
                    <tr><td>06:30 PM - 08:30 PM</td><td><strong>Hypertrophy Arms Split</strong> (Med Intensity)</td><td>Coach Arjun</td></tr>
                </table>
                <p>Focus: Lateral width, shoulder strength, and high-volume arm pumps.</p>
            `;
        }
        if (cleanQuery.includes("friday") || cleanQuery.includes("fri ")) {
            return `
                <p>Here is the <strong>Friday Lower Body split</strong>:</p>
                <table>
                    <tr><th>Time</th><th>Class</th><th>Coach</th></tr>
                    <tr><td>06:00 AM - 08:30 AM</td><td><strong>Lower Body Heavy Squats</strong> (Extreme)</td><td>Coach Vikram</td></tr>
                    <tr><td>06:00 PM - 08:00 PM</td><td><strong>Leg Hypertrophy & Calves</strong> (High Intensity)</td><td>Coach Arjun</td></tr>
                </table>
                <p>Focus: Leg mass, quad mechanics, and calf development.</p>
            `;
        }
        if (cleanQuery.includes("saturday") || cleanQuery.includes("sat ")) {
            return `
                <p>Here is the <strong>Saturday Athletic Power Split</strong>:</p>
                <table>
                    <tr><th>Time</th><th>Class</th><th>Coach</th></tr>
                    <tr><td>08:00 AM - 10:00 AM</td><td><strong>CrossFit Athletic Conditioning</strong> (Extreme)</td><td>Coach Priya</td></tr>
                    <tr><td>05:00 PM - 07:00 PM</td><td><strong>Full Body Functional Power</strong> (High Intensity)</td><td>Coach Vikram</td></tr>
                </table>
                <p>Focus: Heavy carries, kettlebell clean circuits, and real-world stamina.</p>
            `;
        }
        if (cleanQuery.includes("sunday") || cleanQuery.includes("sun ")) {
            return `
                <p><strong>Sunday: Absolute Rest & Muscle Repair</strong></p>
                <ul>
                    <li><strong>Status:</strong> Floor Closed.</li>
                    <li><strong>Rehabilitation:</strong> Foam rolling, hot baths, and targeted stretching.</li>
                    <li><strong>Hydration target:</strong> 4 Liters minimum.</li>
                    <li><strong>Sleep:</strong> 9 hours target.</li>
                </ul>
                <p>Sundays are closed for deep tissue repair. Recovery is essential, OG!</p>
            `;
        }
        
        // 2. Coach Specific Schedule Queries
        if (cleanQuery.includes("vikram")) {
            return `
                <p><strong>Coach Vikram Singh</strong> leads the following strength & power sessions:</p>
                <ul>
                    <li><strong>Monday (06:00 AM - 08:00 AM)</strong>: Chest & Triceps Power Split</li>
                    <li><strong>Tuesday (06:00 AM - 08:00 AM)</strong>: Back & Biceps Pull Split</li>
                    <li><strong>Thursday (06:00 AM - 08:00 AM)</strong>: Shoulders & Arms Blast</li>
                    <li><strong>Friday (06:00 AM - 08:30 AM)</strong>: Lower Body Heavy Squats</li>
                    <li><strong>Saturday (05:00 PM - 07:00 PM)</strong>: Full Body Functional Power</li>
                </ul>
                <p>Credentials: ISSA Certified in Strength Biomechanics and lifting mechanics.</p>
            `;
        }
        if (cleanQuery.includes("priya")) {
            return `
                <p><strong>Coach Priya Sharma</strong> leads the following conditioning & CrossFit sessions:</p>
                <ul>
                    <li><strong>Monday (10:00 AM - 11:30 AM)</strong>: Cardio Metabolic Conditioning</li>
                    <li><strong>Tuesday (05:30 PM - 06:30 PM)</strong>: CrossFit WOD</li>
                    <li><strong>Wednesday (06:00 PM - 07:30 PM)</strong>: High Intensity Interval Training (HIIT)</li>
                    <li><strong>Saturday (08:00 AM - 10:00 AM)</strong>: CrossFit Athletic Conditioning</li>
                </ul>
                <p>Credentials: ACE Certified in high-intensity cardiovascular conditioning.</p>
            `;
        }
        if (cleanQuery.includes("arjun")) {
            return `
                <p><strong>Coach Arjun Rao</strong> leads the following hypertrophy & mobility sessions:</p>
                <ul>
                    <li><strong>Monday (06:00 PM - 08:00 PM)</strong>: Chest & Triceps Hypertrophy</li>
                    <li><strong>Tuesday (07:00 PM - 08:30 PM)</strong>: Biceps & Lats Volumizer</li>
                    <li><strong>Wednesday (07:00 AM - 08:30 AM)</strong>: Active Mobility & Core Stability</li>
                    <li><strong>Thursday (06:30 PM - 08:30 PM)</strong>: Hypertrophy Arms Split</li>
                    <li><strong>Friday (06:00 PM - 08:00 PM)</strong>: Leg Hypertrophy & Calves</li>
                </ul>
                <p>Credentials: NASM Certified, specializing in muscular volume growth and performance nutrition.</p>
            `;
        }

        // 3. BMI Calculator
        if (cleanQuery.includes("bmi") || (cleanQuery.includes("calculate") && (cleanQuery.includes("body mass") || cleanQuery.includes("index")))) {
            if (biometrics.weight && biometrics.height) {
                const weight = biometrics.weight;
                const height = biometrics.height;
                const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);
                let progress = (bmi / 40) * 100;
                if (progress > 100) progress = 100;
                if (progress < 10) progress = 10;
                
                let category = "";
                let barClass = "";
                if (bmi < 18.5) { category = "UNDERWEIGHT"; barClass = "blue"; }
                else if (bmi < 25) { category = "NORMAL WEIGHT"; barClass = "green"; }
                else if (bmi < 30) { category = "OVERWEIGHT"; barClass = "yellow"; }
                else { category = "OBESE"; barClass = "red"; }
                
                return `
                    <p>I have calculated your Body Mass Index (BMI), OG! Here are your biometric values:</p>
                    <div class="chat-calc-card">
                        <div class="chat-calc-title">
                            <span>BMI CALCULATOR</span>
                            <i class="fa-solid fa-calculator"></i>
                        </div>
                        <div class="chat-calc-main">
                            <span class="chat-calc-val">${bmi}</span>
                            <span class="chat-calc-unit">BMI Score</span>
                        </div>
                        <div class="chat-calc-progress">
                            <div class="chat-calc-bar ${barClass}" style="width: ${progress}%"></div>
                        </div>
                        <p class="chat-calc-desc">Status: <strong>${category}</strong>.<br>Height: ${Math.round(height)} cm | Weight: ${Math.round(weight)} kg</p>
                    </div>
                    <p>To optimize your body composition, check in with Coach Vikram for a custom plan!</p>
                `;
            } else {
                return "I can calculate your BMI on the fly, OG! Please provide your weight and height. For example, say: <em>'Calculate BMI for 75kg and 180cm'</em>.";
            }
        }
        
        // 4. BMR / Calorie / TDEE
        if (cleanQuery.includes("bmr") || cleanQuery.includes("calorie") || cleanQuery.includes("tdee") || cleanQuery.includes("burn") || cleanQuery.includes("metabolism")) {
            if (biometrics.weight) {
                const weight = biometrics.weight;
                const height = biometrics.height || 175;
                const age = biometrics.age || 25;
                const gender = biometrics.gender;
                const activity = biometrics.activity;
                
                const bmr = gender === "male"
                    ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
                    : Math.round(10 * weight + 6.25 * height - 5 * age - 161);
                    
                const tdee = Math.round(bmr * activity);
                
                let activityStr = "Light Activity";
                if (activity === 1.2) activityStr = "Sedentary";
                else if (activity === 1.55) activityStr = "Moderate Activity";
                else if (activity === 1.725) activityStr = "Extreme Activity";
                
                return `
                    <p>Here are your customized daily metabolic rates based on your stats:</p>
                    <div class="chat-calc-card">
                        <div class="chat-calc-title">
                            <span>METABOLIC RATE (BMR & TDEE)</span>
                            <i class="fa-solid fa-fire-flame-simple"></i>
                        </div>
                        <div class="chat-calc-main">
                            <span class="chat-calc-val">${tdee.toLocaleString()}</span>
                            <span class="chat-calc-unit">kcal / Day</span>
                        </div>
                        <p class="chat-calc-desc">
                            <strong>BMR (Base Burn):</strong> ${bmr.toLocaleString()} kcal<br>
                            <strong>TDEE (Maintenance):</strong> ${tdee.toLocaleString()} kcal<br>
                            <strong>Inputs:</strong> Weight ${Math.round(weight)}kg | Height ${Math.round(height)}cm | Age ${age} | Gender ${gender} | Activity: ${activityStr}
                        </p>
                    </div>
                    <p>Consume <strong>${Math.round(tdee - 400)} kcal</strong> for a structured fat loss deficit, or <strong>${Math.round(tdee + 300)} kcal</strong> for muscle gain hypertrophy!</p>
                `;
            } else {
                return "I can calculate your BMR and Daily Calorie needs! Please specify your weight. For example: <em>'Calculate calories for 80kg, 180cm, 25 years old male'</em>.";
            }
        }
        
        // 5. Hydration / Water
        if (cleanQuery.includes("water") || cleanQuery.includes("hydrate") || cleanQuery.includes("drink")) {
            if (biometrics.weight) {
                const weight = biometrics.weight;
                const exercise = biometrics.exercise;
                const waterL = (weight * 0.033) + ((exercise / 30) * 0.35);
                const glasses = Math.round(waterL * 4);
                
                return `
                    <p>Hydration is vital for cellular repair and pump. Here is your daily hydration target:</p>
                    <div class="chat-calc-card">
                        <div class="chat-calc-title">
                            <span>DAILY HYDRATION TARGET</span>
                            <i class="fa-solid fa-glass-water"></i>
                        </div>
                        <div class="chat-calc-main">
                            <span class="chat-calc-val">${waterL.toFixed(1)}</span>
                            <span class="chat-calc-unit">Liters / Day</span>
                        </div>
                        <p class="chat-calc-desc">
                            Equivalent to approximately <strong>${glasses} glasses</strong> (250ml each).<br>
                            Calculated based on ${Math.round(weight)}kg bodyweight and ${exercise} minutes of exercise.
                        </p>
                    </div>
                    <p>Make sure to keep sipping water during your training floor sets at OG FITNESS!</p>
                `;
            } else {
                return "I can calculate your daily water intake! Tell me your weight. Example: <em>'How much water should I drink for 75kg weight?'</em>.";
            }
        }
        
        // 6. Protein
        if (cleanQuery.includes("protein") || cleanQuery.includes("macro") || cleanQuery.includes("chicken") || cleanQuery.includes("egg")) {
            if (biometrics.weight) {
                const weight = biometrics.weight;
                let goal = "gain";
                let multiplier = 2.0;
                if (cleanQuery.includes("loss") || cleanQuery.includes("shred") || cleanQuery.includes("cut")) {
                    multiplier = 1.6;
                    goal = "fat loss";
                } else if (cleanQuery.includes("maintain") || cleanQuery.includes("health")) {
                    multiplier = 1.2;
                    goal = "general health";
                }
                
                const proteinG = Math.round(weight * multiplier);
                const eggWhites = Math.round(proteinG / 6);
                const chickenG = Math.round((proteinG / 25) * 100);
                
                return `
                    <p>To repair muscle fibers, here is your customized protein target for <strong>${goal}</strong>:</p>
                    <div class="chat-calc-card">
                        <div class="chat-calc-title">
                            <span>DAILY PROTEIN GOAL</span>
                            <i class="fa-solid fa-dumbbell"></i>
                        </div>
                        <div class="chat-calc-main">
                            <span class="chat-calc-val">${proteinG}</span>
                            <span class="chat-calc-unit">Grams / Day</span>
                        </div>
                        <p class="chat-calc-desc">
                            <strong>Raw Source Equivalents:</strong><br>
                            🥚 ~<strong>${eggWhites} Egg Whites</strong>, OR<br>
                            🍗 ~<strong>${chickenG}g Cooked Chicken Breast</strong>
                        </p>
                    </div>
                    <p>Ask our shake bar team to prepare custom shakes according to this daily goal!</p>
                `;
            } else {
                return "I can calculate your daily protein needs! Please provide your weight in kg. Example: <em>'How much protein do I need for 70kg muscle building?'</em>.";
            }
        }
        
        // Keyword lookup loop
        let bestMatchKey = null;
        let maxMatches = 0;
        
        for (const [key, category] of Object.entries(localReplies)) {
            let matches = 0;
            for (const keyword of category.keywords) {
                if (cleanQuery.includes(keyword)) {
                    matches++;
                }
            }
            if (matches > maxMatches) {
                maxMatches = matches;
                bestMatchKey = key;
            }
        }
        
        if (bestMatchKey) {
            return localReplies[bestMatchKey].response;
        }
        
        return "I have received your request, OG! Our luxury performance floor in Vijayawada has everything you need. You can contact our desk directly at <strong>+91 72228 53999</strong> or drop by to check out our bio-mechanic machines!";
    }

    // Appending Chat messages
    function appendChatMessage(text, sender, save = true, customTime = null, isHtml = false) {
        if (!chatMessages) return;
        const msgDiv = document.createElement("div");
        msgDiv.className = `chat-msg ${sender}`;
        
        const now = new Date();
        const timeStr = customTime || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (isHtml || sender === "bot") {
            let content = text;
            if (!text.trim().startsWith("<p>") && !text.trim().startsWith("<div class=")) {
                content = `<p>${text}</p>`;
            }
            msgDiv.innerHTML = `${content}<span class="time">${timeStr}</span>`;
        } else {
            const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            msgDiv.innerHTML = `<p>${escapedText}</p><span class="time">${timeStr}</span>`;
        }
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        if (save) {
            saveChatHistory();
        }
    }

    // Storing history in session
    function saveChatHistory() {
        try {
            const messageElements = document.querySelectorAll(".chat-msg");
            const history = [];
            
            // Skip welcome message
            for (let i = 1; i < messageElements.length; i++) {
                const el = messageElements[i];
                const sender = el.classList.contains("user") ? "user" : "bot";
                const timeEl = el.querySelector(".time");
                const time = timeEl ? timeEl.innerText : "Just now";
                
                const clone = el.cloneNode(true);
                const tEl = clone.querySelector(".time");
                if (tEl) tEl.remove();
                
                history.push({
                    text: clone.innerHTML,
                    sender: sender,
                    time: time
                });
            }
            sessionStorage.setItem("og_chat_history", JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save chat history", e);
        }
    }

    // Loading history
    function loadChatHistory() {
        try {
            const savedHistory = sessionStorage.getItem("og_chat_history");
            if (savedHistory && chatMessages) {
                const messages = JSON.parse(savedHistory);
                chatMessages.innerHTML = `
                    <!-- Welcome Msg -->
                    <div class="chat-msg bot">
                        <p>Welcome to <span class="og-text">OG</span> FITNESS! I am the <span class="og-text">OG</span> Bot. Ask me about our classes, training schedules, pricing, coaches, workouts, or calculators!</p>
                        <span class="time">Just now</span>
                    </div>
                `;
                messages.forEach(msg => {
                    appendChatMessage(msg.text, msg.sender, false, msg.time, true);
                });
            }
        } catch (e) {
            console.error("Failed to load chat history", e);
        }
    }

    // Typing dots animation controls
    function showTypingIndicator() {
        if (!chatMessages) return null;
        const indicator = document.createElement("div");
        indicator.className = "chat-msg bot typing-msg";
        indicator.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return indicator;
    }
    
    function hideTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    // Response orchestration
    async function processBotReply(userMsg) {
        const indicator = showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator(indicator);
            const localReply = getLocalResponse(userMsg);
            appendChatMessage(localReply, "bot");
        }, 800);
    }

    // Chatbot Panel Toggle Bindings
    if (chatToggle && chatPanel && chatClose) {
        chatToggle.addEventListener("click", () => {
            chatPanel.classList.toggle("active");
            if (notifBadge) notifBadge.style.display = "none";
        });
        
        chatClose.addEventListener("click", () => {
            chatPanel.classList.remove("active");
        });
        
        if (chatInputForm) {
            chatInputForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const messageText = chatUserMsg.value.trim();
                if (!messageText) return;
                
                appendChatMessage(messageText, "user");
                chatUserMsg.value = "";
                
                processBotReply(messageText);
            });
        }
        
        // Handle Quick replies
        document.querySelectorAll(".btn-quick-reply").forEach(btn => {
            btn.addEventListener("click", () => {
                const messageText = btn.getAttribute("data-msg");
                appendChatMessage(messageText, "user");
                processBotReply(messageText);
            });
        });
    }

    // Initialize state
    loadChatHistory();


    /* ----------------------------------------------------------------------
       16. WORKOUT RECOMMENDATION ENGINE MODAL
       ---------------------------------------------------------------------- */
    const recBtn = document.getElementById("btn-recommend-plan");
    const recModal = document.getElementById("recommendation-modal");
    const modalClose = document.getElementById("modal-close-btn");
    const getRecBtn = document.getElementById("btn-get-rec-results");
    const recForm = document.getElementById("recommendation-form");
    const recResults = document.getElementById("recommendation-results");
    const recText = document.getElementById("rec-result-text");
    const recJoinBtn = document.getElementById("btn-buy-plan"); // modal trigger buys
    
    if(recBtn && recModal && modalClose && getRecBtn) {
        recBtn.addEventListener("click", () => {
            recModal.classList.add("active");
            recForm.style.display = "block";
            recResults.style.display = "none";
            
            // Set first step active
            document.querySelectorAll(".modal-step").forEach((s, idx) => {
                s.classList.toggle("active", idx === 0);
            });
        });
        
        modalClose.addEventListener("click", () => {
            recModal.classList.remove("active");
        });
        
        // Quick step routing simulation (all 3 steps shown in one simple vertical scrolling flow, or tab panels. We will do tab panels)
        const step1 = document.getElementById("step-1");
        const step2 = document.getElementById("step-2");
        const step3 = document.getElementById("step-3");
        
        // Let's listen to clicks on options to slide down or just click Calculate
        getRecBtn.addEventListener("click", () => {
            const goal = document.querySelector('input[name="rec-goal"]:checked').value;
            const days = document.querySelector('input[name="rec-days"]:checked').value;
            const exp = document.querySelector('input[name="rec-exp"]:checked').value;
            
            // Generate result
            let recommendationText = "";
            if (goal.includes("Strength")) {
                recommendationText = `<h2>Heavy Hypertrophy Split</h2><p>Given your goal to build strength and experience level (${exp}), we recommend training 4 days a week focusing on Progressive Overload. You should join our <strong>Elite Plan</strong> to secure coach Vikram's guidance on squat/deadlift mechanics.</p>`;
            } else if (goal.includes("Fat Loss")) {
                recommendationText = `<h2>Metabolic Conditioning HIIT</h2><p>For fat loss and body shredding, we recommend a 3-5 days split of Cardio Metabolic and HIIT intervals under Priya Sharma. Our <strong>Premium Plan</strong> covers all group classes and cardio zones.</p>`;
            } else {
                recommendationText = `<h2>CrossFit & General Fitness Matrix</h2><p>For stamina, athleticism, and active movement, we suggest joining our <strong>Basic Plan</strong> and combining functional training blocks. Monday/Friday Cardio, Tuesday/Saturday Olympic circuits.</p>`;
            }
            
            recText.innerHTML = recommendationText;
            recForm.style.display = "none";
            recResults.style.display = "block";
        });
        
        document.getElementById("btn-rec-join").addEventListener("click", () => {
            recModal.classList.remove("active");
            window.location.hash = "#membership";
        });
    }
    
    // Quick handle plan choice triggers mapping to Contact section
    const buyBtns = document.querySelectorAll(".btn-buy-plan");
    buyBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const plan = btn.getAttribute("data-plan");
            const goalInput = document.getElementById("contact-goal");
            const msgInput = document.getElementById("contact-message");
            
            if(goalInput && msgInput) {
                // Pre-fill fields
                msgInput.value = `I am interested in registering for the ${plan}. Please get back to me.`;
                window.location.hash = "#contact";
            }
        });
    });

});
