<?php if (!empty($attachments)): ?>
<div class="attachments-section">
    <h3 class="attachments-title">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21.4 11.6-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 1 1-2.8-2.8l8.5-8.5"/></svg>
        Attachments <span><?php echo count($attachments); ?></span>
    </h3>
    <ul class="attachments-list">
        <?php foreach ($attachments as $file): ?>
            <?php
            $file_path = $file['file_path'];
            $file_extension = strtolower(pathinfo($file['file_name'], PATHINFO_EXTENSION));
            $is_pdf = ($file_extension === 'pdf');
            $full_path = $_SERVER['DOCUMENT_ROOT'] . $file_path;
            $file_size_formatted = file_exists($full_path) ? formatFileSize(filesize($full_path)) : '';
            $file_url = getFileUrl($file_path);
            $encoded_url = htmlspecialchars(json_encode($file_url), ENT_QUOTES, 'UTF-8');
            $encoded_name = htmlspecialchars(json_encode($file['file_name']), ENT_QUOTES, 'UTF-8');
            ?>
            <li class="attachment-item">
                <span class="attachment-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16h16V8Zm0 0v6h6M8 13h8m-8 4h6"/></svg>
                </span>
                <div class="pdf-options">
                    <div class="attachment-details">
                        <?php if ($is_pdf): ?>
                            <a href="javascript:void(0)" class="attachment-link pdf-view-link"
                               onclick='openPDFViewer(<?php echo $encoded_url; ?>, <?php echo $encoded_name; ?>)'>
                                <?php echo htmlspecialchars($file['file_name']); ?>
                            </a>
                        <?php else: ?>
                            <a href="<?php echo htmlspecialchars($file_url); ?>" class="attachment-link" target="_blank">
                                <?php echo htmlspecialchars($file['file_name']); ?>
                            </a>
                        <?php endif; ?>
                        <span class="attachment-size"><?php echo strtoupper(htmlspecialchars($file_extension)); ?><?php echo $file_size_formatted ? ' · ' . htmlspecialchars($file_size_formatted) : ''; ?></span>
                    </div>
                    <div class="pdf-actions">
                        <button type="button" class="pdf-action-btn" title="Copy link" aria-label="Copy link"
                                onclick='navigator.clipboard.writeText(<?php echo $encoded_url; ?>); this.classList.add("is-copied"); setTimeout(() => this.classList.remove("is-copied"), 1200);'>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7.5l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7.5l1.7-1.7"/></svg>
                        </button>
                        <a href="<?php echo htmlspecialchars($file_url); ?>" class="pdf-action-btn"
                           download="<?php echo htmlspecialchars($file['file_name']); ?>" title="Download" aria-label="Download">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14"/></svg>
                        </a>
                    </div>
                </div>
            </li>
        <?php endforeach; ?>
    </ul>
</div>
<?php endif; ?>
