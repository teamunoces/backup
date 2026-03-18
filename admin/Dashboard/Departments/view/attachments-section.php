<?php if (!empty($attachments)): ?>
<div class="attachments-section">
    <h3 class="attachments-title">📎 Attachments (<?php echo count($attachments); ?>)</h3>
    <ul class="attachments-list">
        <?php foreach ($attachments as $file): ?>
            <?php
            // Construct full file path
            $file_path = $file['file_path'];
            
            // Check if it's a PDF
            $file_extension = strtolower(pathinfo($file['file_name'], PATHINFO_EXTENSION));
            $is_pdf = ($file_extension == 'pdf');
            
            // Get file size if file exists
            $full_path = $_SERVER['DOCUMENT_ROOT'] . $file_path;
            $file_size_formatted = '';
            if (file_exists($full_path)) {
                $file_size = filesize($full_path);
                $file_size_formatted = formatFileSize($file_size);
            }
            
            // Get proper file URL - FIXED: Use absolute URL
            $file_url = getFileUrl($file_path);
            ?>
            <li class="attachment-item">
                <span class="attachment-icon">
                    <?php echo $is_pdf ? '📕' : '📄'; ?>
                </span>
                
                <?php if ($is_pdf): ?>
                    <!-- PDF with viewer options -->
                    <div class="pdf-options">
                        <a href="javascript:void(0)" 
                           class="attachment-link pdf-view-link" 
                           onclick="openPDFViewer('<?php echo htmlspecialchars($file_url); ?>', '<?php echo htmlspecialchars($file['file_name']); ?>')">
                            <?php echo htmlspecialchars($file['file_name']); ?>
                        </a>
                        <span class="attachment-size">(<?php echo $file_size_formatted; ?>)</span>
                        
                        <div class="pdf-actions">
                            <a href="<?php echo htmlspecialchars($file_url); ?>" 
                               class="pdf-action-btn" 
                               target="_blank" 
                               title="Open in new tab">
                                🔗
                            </a>
                            <a href="<?php echo htmlspecialchars($file_url); ?>" 
                               class="pdf-action-btn" 
                               download="<?php echo htmlspecialchars($file['file_name']); ?>" 
                               title="Download">
                                ⬇️
                            </a>
                        </div>
                    </div>
                <?php else: ?>
                    <!-- Regular file -->
                    <a href="<?php echo htmlspecialchars($file_url); ?>" 
                       class="attachment-link" 
                       target="_blank">
                        <?php echo htmlspecialchars($file['file_name']); ?>
                    </a>
                    <span class="attachment-size">(<?php echo $file_size_formatted; ?>)</span>
                <?php endif; ?>
            </li>
        <?php endforeach; ?>
    </ul>
</div>
<?php endif; ?>