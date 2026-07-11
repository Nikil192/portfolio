document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggler
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check for saved user preference, if any, on load of the website
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        if (themeToggleBtn) {
            updateThemeIcon(savedTheme, themeToggleBtn.querySelector('i'));
        }
    }

    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('i');
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
            updateThemeIcon(newTheme, themeIcon);
        });
    }

    function updateThemeIcon(theme, icon) {
        if (!icon) return;
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun'; // Show sun when dark to toggle light
        } else {
            icon.className = 'fa-solid fa-moon'; // Show moon when light to toggle dark
        }
    }

    // 1.5 Photography Specific Theme Toggler
    const photoThemeToggleBtn = document.getElementById('theme-toggle-photo');
    if (photoThemeToggleBtn) {
        const photoThemeIcon = photoThemeToggleBtn.querySelector('i');
        
        const savedPhotoTheme = localStorage.getItem('photo-theme') || 'light';
        document.body.setAttribute('data-photo-theme', savedPhotoTheme);
        updatePhotoThemeIcon(savedPhotoTheme, photoThemeIcon);

        photoThemeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-photo-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.body.setAttribute('data-photo-theme', newTheme);
            localStorage.setItem('photo-theme', newTheme);
            updatePhotoThemeIcon(newTheme, photoThemeIcon);
        });
    }

    function updatePhotoThemeIcon(theme, icon) {
        if (!icon) return;
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun'; 
        } else {
            icon.className = 'fa-solid fa-moon'; 
        }
    }

    // 2. Scroll Reveal Animation using Intersection Observer
    const reveals = document.querySelectorAll('.reveal, .photo-reveal');

    const observerOptions = {
        root: null,
        rootMargin: '0px', // Trigger immediately when entering
        threshold: 0.05
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(el => {
        revealObserver.observe(el);
    });

    // Manually trigger elements that are already in the viewport on load to prevent blank screens
    setTimeout(() => {
        reveals.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('active');
            }
        });
    }, 150);

    // 3. Modal Logic
    const modal = document.getElementById("reportModal");
    const span = document.getElementsByClassName("close-modal")[0];

    if (span) {
        span.onclick = function() {
            closeModal();
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = "none";
            }, 300); // match css transition
        }
    }
});

// Report Data
const reportsData = {
    report1: `
        <h3>Process Optimization & Sensor Tolerance Proposal</h3>
        <p><strong>Station:</strong> Final Assembly Station – Akbar Line<br>
        <strong>Subject:</strong> Color Sensor Threshold Optimization via Modified Golden Sample<br>
        <strong>Prepared By:</strong> Nikil Venkatanarayanan</p>
        
        <h4>1. Executive Summary</h4>
        <p>The Final Assembly Station on the Akbar line is currently experiencing persistent cycle-time delays due to false rejects at the color sensor inspection point. The sensor frequently fails to detect physically acceptable, slightly misaligned white labels.</p>
        <p>This proposal outlines a zero-cost, physical engineering solution using a modified golden sample to optimize the sensor’s acceptance threshold. This will immediately eliminate false-reject downtime without requiring complex software modifications, PLC reprogramming, or new hardware.</p>
        
        <h4>2. Problem Statement & Root Cause Analysis</h4>
        <p>The current inspection system utilizes a 3-digit color/contrast sensor configured for a "single-point teach."</p>
        <ul>
            <li><strong>Background Value (Bare Black Plastic):</strong> ~600</li>
            <li><strong>Target Value (Perfect White Label):</strong> 980+</li>
            <li><strong>With Label Value:</strong> 900 - 999</li>
        </ul>
        <p><strong>The Root Cause:</strong> Because the sensor uses a single-point teach on a perfectly aligned white label (980), its internal logic automatically establishes a rigid pass/fail threshold slightly below that mark (estimated at ~940). When a slightly misaligned white label passes the sensor, it reflects a value of 900. Because 900 falls below the strict 940 threshold, the sensor triggers a false reject, halting the line.</p>

        <h4>3. Proposed Engineering Solution</h4>
        <p>We will manipulate the physical teaching standard to force the sensor to adopt a more forgiving tolerance window.</p>
        <p><strong>The Intervention:</strong> Introduce a modified "Golden Sample" featuring a <strong>grey label</strong> instead of a perfect white label.</p>
        <ul>
            <li>The grey label is calibrated to reflect a baseline value of approximately <strong>900</strong>.</li>
            <li>When the operator performs the standard single-point teach at the start of the shift using this grey label, the sensor's internal logic will automatically establish a lower pass/fail threshold (estimated at ~850).</li>
            <li>Misaligned white labels reading at 900 will now easily clear this 850 threshold, keeping the line moving continuously.</li>
        </ul>

        <h4>4. Environmental Feasibility & System Robustness</h4>
        <p>This solution is highly robust and engineered specifically for the physical realities of the Akbar line environment:</p>
        <ul>
            <li><strong>Zero Glare Risk:</strong> The background material of the parts is a matte, pure black plastic. It absorbs light rather than reflecting it. This ensures the background value remains a rock-solid 600, eliminating the risk of overhead factory lighting causing false positives on un-labeled parts.</li>
            <li><strong>Massive Safety Margin:</strong> Lowering the pass threshold to 850 still leaves a 250-point differential between a passing part and the bare black plastic background (600). In optical sensing, a 250-point gap is extremely wide, guaranteeing the sensor will never confuse a bare part for a labeled part.</li>
            <li><strong>Optimal Operating Environment:</strong> The plant is a closed, air-conditioned, and highly clean facility. The labels are smooth, meaning dust accumulation is minimal.</li>
            <li><strong>Seamless Maintenance:</strong> To maintain perfect calibration, operators simply need to wipe the golden sample with a cloth during their standard shift-start routine.</li>
        </ul>

        <h4>5. Implementation & Validation Plan</h4>
        <p>This solution can be implemented on the next shift with zero capital expenditure.</p>
        <p><strong>Action Items:</strong></p>
        <ol>
            <li><strong>The Validation Run:</strong> Execute a controlled batch trial consisting of perfectly aligned labels, misaligned labels reading ~900, and parts with no label.</li>
            <li><strong>SOP Update:</strong> Upon successful validation, update the station SOP to instruct operators to teach the sensor using the new grey-label Golden Sample, ensuring it is wiped clean prior to teaching.</li>
        </ol>
    `,
    report2: `
        <h3>Maintenance & Architectural Upgrade Report</h3>
        <p><strong>Station:</strong> P3 Firmware Uploading Station<br>
        <strong>Subject:</strong> Resolution of TCP Modbus Error & System Architecture Upgrade<br>
        <strong>Prepared By:</strong> Nikil Venkatanarayanan</p>

        <h4>1. Problem Statement (The Issue)</h4>
        <p>The P3 Firmware Uploading Station has been experiencing recurring "TCP Modbus Errors," leading to aborted firmware flashes and dropped connections.</p>
        <p>Root cause analysis determined this is an architectural bottleneck rather than a standard software bug. The system was operating on a "Shared Brain" setup, where two separate Industrial PCs (IPCs) were simultaneously communicating with a single Schneider Electric PLC over Modbus TCP. This caused two critical points of failure:</p>
        <ul>
            <li><strong>Network Traffic Overload:</strong> The single PLC processor was overwhelmed by simultaneous network polling from both IPCs, resulting in dropped packets and Modbus timeout errors.</li>
            <li><strong>Modbus Register Conflicts:</strong> Both IPCs were attempting to read/write to the same Modbus memory addresses, leading to cross-talk where the data of one fixture could conflict with the other.</li>
        </ul>

        <h4>2. Executed Solution</h4>
        <p>To resolve this, we upgraded the station from a shared architecture to a <strong>Dedicated Hardware Architecture</strong>. By installing a second, independent PLC, each IPC now has its own dedicated controller and isolated network path.</p>
        <p><strong>My specific technical execution for this upgrade included:</strong></p>
        <ul>
            <li><strong>Logic Extraction & Firmware Backup:</strong> Interfaced with the main PLC using EcoStruxure to safely execute a Master Upload, backing up the original Ladder Logic and hardware configuration.</li>
            <li><strong>Network Configuration & Deployment:</strong> Cloned the master logic, reconfigured the Modbus TCP IP addressing to ensure complete network isolation, and performed the firmware Download into the new, dedicated PLC.</li>
            <li><strong>Physical Panel Wiring:</strong> Terminated and routed the new physical connections. This included wiring the 24V DC power supply lines, Modbus communication cables, and landing the input/output field wires onto the Telefast terminal blocks to ensure proper physical operation.</li>
        </ul>

        <h4>3. Why This is a Permanent Fix</h4>
        <p>This upgrade solves the physical root cause of the Modbus errors.</p>
        <ul>
            <li><strong>Complete Isolation:</strong> IPC 1 and IPC 2 now communicate on entirely separate IP addresses and memory registers. Data cross-talk is now physically impossible.</li>
            <li><strong>Eliminated Bandwidth Bottlenecks:</strong> Network traffic to the PLCs has been cut in half, ensuring zero dropped packets during critical firmware payload transfers.</li>
            <li><strong>Built-in Redundancy:</strong> By decoupling the stations, a hardware failure on Station 1 will no longer impact Station 2, securing long-term production uptime.</li>
        </ul>

        <h4>4. Next step</h4>
        <ul>
            <li>Dry run I/O checkout</li>
            <li>Check and execute Golden sample</li>
            <li>Check and execute Red rabbit</li>
            <li>Resume live production testing</li>
        </ul>
    `,
    report3: `
        <h3>CPP Line Layout Reconfiguration</h3>
        <p><strong>Project:</strong> CPP Line Layout Reconfiguration<br>
        <strong>Function:</strong> Manufacturing<br>
        <strong>Department:</strong> Methods<br>
        <strong>Prepared By:</strong> Nikil Venkatanarayanan</p>

        <h4>1. Executive Summary</h4>
        <p>The scheduled installation of the new HDPM Vertical Carousel Supermarket necessitated the reclamation of dedicated floor space currently occupied by the CPP manufacturing line. This report outlines the strategic relocation and extreme lean reconfiguration of the CPP line. By conducting a layout feasibility study, redesigning the workstation sequence, and strategically eliminating a redundant assembly station, the operational footprint was condensed by 31.80%. This reconfiguration successfully recovered 69.86 sq. ft. of high-value factory floor space to accommodate the new HDPM equipment without compromising continuous production flow.</p>

        <h4>2. Problem Statement & Root Cause Analysis</h4>
        <p>The facility faced a direct physical layout conflict between existing continuous operations and the integration of incoming automated hardware.</p>
        <ul>
            <li><strong>The Area Conflict:</strong> The facility required a dedicated allocation of 219.69 sq. ft. for the upcoming HDPM Vertical Carousel Supermarket installation.</li>
            <li><strong>The Existing Footprint:</strong> The current layout of the CPP line (measuring 3.22 m x 6.34 m) occupied 20.41 m², sitting directly inside the newly allocated zone.</li>
            <li><strong>The Relocation Constraint:</strong> A comprehensive layout feasibility study was conducted, which established that the CPP line was the only suitable candidate across the floor capable of being relocated to support the new installation.</li>
        </ul>

        <h4>3. Executed Engineering Solution & Station Integration</h4>
        <p>To resolve the space conflict and maximize efficiency, the CPP line underwent a complete lean transformation rather than just a simple relocation.</p>
        <ul>
            <li><strong>Strategic Relocation:</strong> The CPP line was moved to the required space behind the P5 line, as it was identified as the most suitable and efficient placement on the factory floor.</li>
            <li><strong>Station Elimination & Process Integration:</strong> To further condense the footprint, the dedicated <strong>Wire Management Assembly</strong> station was entirely removed from the new layout. The wire management processes were strategically absorbed into the remaining adjacent stations (such as Bezel and Panel Assembly) by introducing new, specialized assembly fixtures. This eliminated the need for an independent workstation and streamlined the operator workflow.</li>
            <li><strong>The Condensed Layout:</strong> The physical workstation arrangement was completely redesigned. The new layout dimensions measure 5.90 m x 2.36 m, bringing the total occupied area down to just 13.92 m².</li>
        </ul>

        <h4>4. Implementation Impact & Results</h4>
        <p>This strategic relocation and layout optimization yielded immediate, highly measurable benefits for the SEIPL facility:</p>
        <ul>
            <li><strong>Feasibility Confirmed:</strong> Layout feasibility established that the CPP line was the only suitable candidate for relocation into the available space, validating the strategic choice.</li>
            <li><strong>Optimal Placement:</strong> Designed a new layout by relocating the CPP line behind the P5 line, ensuring a feasible and highly optimized arrangement.</li>
            <li><strong>Total Space Reduction:</strong> The redesign successfully reduced the total line footprint by <strong>31.80%</strong>.</li>
            <li><strong>High-Value Floor Space Reclaimed:</strong> The project yielded a direct physical space savings of <strong>69.86 sq. ft.</strong>, matching the exact space required for the HDPM line.</li>
            <li><strong>Operational Continuity:</strong> The new layout maintained seamless space utilization and operational efficiency, successfully absorbing the wire management tasks without a dedicated station and fully supporting the integration of the new HDPM hardware.</li>
        </ul>
    `,
    report4: `
        <h3>Production Kitting & Traceability</h3>
        <p><strong>Prepared By:</strong> Nikil Venkatanarayanan</p>
        <p>Executed hardware kitting, component labeling, and inventory reconciliation across multiple part references to ensure strict BOM accuracy and secure assembly line readiness.</p>
    `
};

window.openReport = function(reportId) {
    const modal = document.getElementById("reportModal");
    const modalBody = document.getElementById("modal-body");
    
    if (reportsData[reportId] && modal && modalBody) {
        modalBody.innerHTML = reportsData[reportId];
        modal.style.display = "block";
        
        // Small delay to allow display:block to apply before adding class for opacity transition
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

// Certificate Modal Logic
window.openCert = function(certId) {
    const modal = document.getElementById("reportModal");
    const modalBody = document.getElementById("modal-body");
    
    if (modal && modalBody) {
        // Map certificate IDs to human readable titles
        const certTitles = {
            'matlab': 'MATLAB Onramp',
            'vlsi-fundamentals': 'VLSI Chip Design (Fundamentals)',
            'vlsi-simulation': 'VLSI Chip Design (Simulation)',
            'deloitte': 'Deloitte Cyber Job Simulation',
            'hackerrank-python': 'GIAC Python Coder',
            'hackerrank-sql': 'SQL (Basic)'
        };

        const title = certTitles[certId] || 'Certificate';
        
        modalBody.innerHTML = `
            <h3>${title}</h3>
            <div class="cert-image-container" style="height: 70vh; width: 100%;">
                <iframe src="assets/${certId}.pdf" width="100%" height="100%" style="border: 1px solid var(--border); border-radius: 4px;" 
                    onerror="this.outerHTML='<div style=\\'padding: 2rem; border: 1px dashed var(--border); text-align: center; color: var(--text-muted);\\'>PDF not found. Please add assets/${certId}.pdf</div>'">
                </iframe>
            </div>
        `;
        
        modal.style.display = "block";
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}
